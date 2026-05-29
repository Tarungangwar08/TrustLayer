import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';
import {
  CredentialFields,
  SignedCredential,
  issueCredential as issueCrypto,
  createSelectivePresentation,
} from './cryptoService';

interface StoredSignedCredential {
  fieldHashes: Record<string, string>;
  merkleRoot: string;
  signature: string;
  publicKey: string;
  salt: string;
  fieldNames: string[];
  encryptedRaw: string;
}

function encryptFields(fields: CredentialFields): string {
  const key = Buffer.from(env.encryptionKey, 'utf8').slice(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(fields), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

function decryptFields(encryptedString: string): CredentialFields {
  const [ivHex, authTagHex, encryptedHex] = encryptedString.split(':');
  const key = Buffer.from(env.encryptionKey, 'utf8').slice(0, 32);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8')) as CredentialFields;
}

export async function createCredential(
  userId: string,
  fields: CredentialFields
): Promise<{ id: string; metadata: object }> {
  const signedCred = await issueCrypto(fields);
  const encryptedRaw = encryptFields(fields);

  const credential = await prisma.credential.create({
    data: {
      userId,
      metadata: {
        degree: fields.degree,
        issuerName: fields.issuerName,
        issuedAt: fields.issueDate,
        fieldCount: 7,
      },
      signedCredential: {
        fieldHashes: signedCred.fieldHashes,
        merkleRoot: signedCred.merkleRoot,
        signature: signedCred.signature,
        publicKey: signedCred.publicKey,
        salt: signedCred.salt,
        fieldNames: signedCred.fieldNames,
        encryptedRaw,
      },
    },
  });

  return { id: credential.id, metadata: credential.metadata as object };
}

export async function getUserCredentials(userId: string): Promise<object[]> {
  const credentials = await prisma.credential.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return credentials as unknown as object[];
}

export async function createSharePresentation(
  userId: string,
  credentialId: string,
  selectedFields: string[],
  expiryHours: number
): Promise<{ shareToken: string; shareUrl: string; expiresAt: string }> {
  const credential = await prisma.credential.findFirst({
    where: { id: credentialId, userId },
  });

  if (!credential) {
    throw new Error('Credential not found');
  }

  const stored = credential.signedCredential as unknown as StoredSignedCredential;
  const originalFields = decryptFields(stored.encryptedRaw);

  const signedCredential: SignedCredential = {
    fieldHashes: stored.fieldHashes,
    fieldNames: stored.fieldNames,
    merkleRoot: stored.merkleRoot,
    signature: stored.signature,
    publicKey: stored.publicKey,
    salt: stored.salt,
  };

  const presentation = createSelectivePresentation(
    signedCredential,
    originalFields,
    selectedFields,
    expiryHours
  );

  const record = await prisma.sharePresentation.create({
    data: {
      credentialId,
      userId,
      presentation: presentation as unknown as never,
      selectedFields,
      expiresAt: new Date(presentation.expiresAt),
    },
  });

  return {
    shareToken: record.shareToken,
    shareUrl: `${env.frontendUrl}/share/${record.shareToken}`,
    expiresAt: presentation.expiresAt,
  };
}

export async function getSharePresentation(shareToken: string): Promise<object | null> {
  const record = await prisma.sharePresentation.findUnique({
    where: { shareToken },
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;

  await prisma.sharePresentation.update({
    where: { shareToken },
    data: { viewCount: { increment: 1 } },
  });

  return record.presentation as unknown as object;
}
