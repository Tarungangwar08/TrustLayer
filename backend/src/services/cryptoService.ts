import crypto from 'crypto';
import { generateKeyPair, SignJWT, exportJWK, jwtVerify, importJWK } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { MerkleTree } from './merkleTree';

export interface CredentialFields {
  name: string;
  degree: string;
  graduationYear: string;
  cgpa: string;
  marks: string;
  issuerName: string;
  issueDate: string;
}

export interface SignedCredential {
  fieldHashes: Record<string, string>;
  fieldNames: string[];
  merkleRoot: string;
  signature: string;
  publicKey: string;
  salt: string;
}

export interface VerifiablePresentation {
  type: 'VerifiablePresentation';
  presentationId: string;
  disclosedFields: Record<string, string>;
  fieldHashes: Record<string, string>;
  merkleProofs: Record<string, string[]>;
  merkleRoot: string;
  signature: string;
  publicKey: string;
  issuerName: string;
  issuedAt: string;
  expiresAt: string;
  salt: string;
  totalFieldCount: number;
  hiddenFieldCount: number;
}

export interface VerificationResult {
  valid: boolean;
  checks: {
    signatureValid: boolean;
    fieldsIntact: boolean;
    merkleValid: boolean;
    notExpired: boolean;
  };
  disclosedFields: Record<string, { value: string; verified: boolean }>;
  issuerName: string;
  issuedAt: string;
  expiresAt: string;
  hiddenFieldCount: number;
  presentationId: string;
}

const FIELD_ORDER: (keyof CredentialFields)[] = [
  'name',
  'degree',
  'graduationYear',
  'cgpa',
  'marks',
  'issuerName',
  'issueDate',
];

function hashField(fieldName: string, fieldValue: string, salt: string): string {
  return crypto
    .createHash('sha256')
    .update(`${fieldName}:${fieldValue}:${salt}`)
    .digest('hex');
}

export async function issueCredential(fields: CredentialFields): Promise<SignedCredential> {
  const salt = crypto.randomBytes(32).toString('hex');

  const fieldHashes: Record<string, string> = {};
  for (const fieldName of FIELD_ORDER) {
    fieldHashes[fieldName] = hashField(fieldName, fields[fieldName], salt);
  }

  const leaves = FIELD_ORDER.map((f) => fieldHashes[f]);
  const merkleTree = new MerkleTree(leaves);
  const merkleRoot = merkleTree.getRoot();

  const { privateKey, publicKey } = await generateKeyPair('EdDSA', { crv: 'Ed25519' });

  const signature = await new SignJWT({ merkleRoot })
    .setProtectedHeader({ alg: 'EdDSA' })
    .setIssuedAt()
    .setExpirationTime('10y')
    .sign(privateKey);

  const publicKeyJwk = await exportJWK(publicKey);
  const publicKeyString = JSON.stringify(publicKeyJwk);

  return {
    fieldHashes,
    fieldNames: [...FIELD_ORDER],
    merkleRoot,
    signature,
    publicKey: publicKeyString,
    salt,
  };
}

export function createSelectivePresentation(
  signedCredential: SignedCredential,
  originalFields: CredentialFields,
  selectedFields: string[],
  expiryHours: number = 24
): VerifiablePresentation {
  for (const field of selectedFields) {
    if (!FIELD_ORDER.includes(field as keyof CredentialFields)) {
      throw new Error(`Invalid field name: ${field}`);
    }
  }

  const leaves = FIELD_ORDER.map((f) => signedCredential.fieldHashes[f]);
  const merkleTree = new MerkleTree(leaves);

  const disclosedFields: Record<string, string> = {};
  const fieldHashes: Record<string, string> = {};
  const merkleProofs: Record<string, string[]> = {};

  for (const field of selectedFields) {
    const leafIndex = FIELD_ORDER.indexOf(field as keyof CredentialFields);
    disclosedFields[field] = originalFields[field as keyof CredentialFields];
    fieldHashes[field] = signedCredential.fieldHashes[field];
    merkleProofs[field] = merkleTree.getProof(leafIndex);
  }

  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

  return {
    type: 'VerifiablePresentation',
    presentationId: uuidv4(),
    disclosedFields,
    fieldHashes,
    merkleProofs,
    merkleRoot: signedCredential.merkleRoot,
    signature: signedCredential.signature,
    publicKey: signedCredential.publicKey,
    issuerName: originalFields.issuerName,
    issuedAt: originalFields.issueDate,
    expiresAt,
    salt: signedCredential.salt,
    totalFieldCount: FIELD_ORDER.length,
    hiddenFieldCount: FIELD_ORDER.length - selectedFields.length,
  };
}

export async function verifyPresentation(
  presentation: VerifiablePresentation
): Promise<VerificationResult> {
  const notExpired = new Date(presentation.expiresAt) > new Date();

  let signatureValid = false;
  try {
    const publicKeyJwk = JSON.parse(presentation.publicKey) as Parameters<typeof importJWK>[0];
    const publicKey = await importJWK(publicKeyJwk, 'EdDSA');
    const { payload } = await jwtVerify(presentation.signature, publicKey);
    signatureValid = payload['merkleRoot'] === presentation.merkleRoot;
  } catch {
    signatureValid = false;
  }

  let fieldsIntact = true;
  let merkleValid = true;
  const disclosedFieldsResult: Record<string, { value: string; verified: boolean }> = {};

  for (const [fieldName, fieldValue] of Object.entries(presentation.disclosedFields)) {
    const recomputed = hashField(fieldName, fieldValue, presentation.salt);
    const hashMatch = recomputed === presentation.fieldHashes[fieldName];
    const fieldMerkleValid = MerkleTree.verifyProof(
      presentation.fieldHashes[fieldName],
      presentation.merkleProofs[fieldName],
      presentation.merkleRoot
    );

    if (!hashMatch) fieldsIntact = false;
    if (!fieldMerkleValid) merkleValid = false;

    disclosedFieldsResult[fieldName] = {
      value: fieldValue,
      verified: hashMatch && fieldMerkleValid,
    };
  }

  const valid = signatureValid && fieldsIntact && merkleValid && notExpired;

  return {
    valid,
    checks: { signatureValid, fieldsIntact, merkleValid, notExpired },
    disclosedFields: disclosedFieldsResult,
    issuerName: presentation.issuerName,
    issuedAt: presentation.issuedAt,
    expiresAt: presentation.expiresAt,
    hiddenFieldCount: presentation.hiddenFieldCount,
    presentationId: presentation.presentationId,
  };
}
