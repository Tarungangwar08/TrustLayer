import { Request, Response, NextFunction } from 'express';
import * as credentialService from '../services/credentialService';
import { VerifiablePresentation, verifyPresentation } from '../services/cryptoService';
import {
  issueCredentialSchema,
  shareCredentialSchema,
  verifyCredentialSchema,
} from '../utils/validators';

export async function issueCredential(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const fields = issueCredentialSchema.parse(req.body);
    const result = await credentialService.createCredential(req.user!.id, fields);

    res.status(201).json({
      success: true,
      data: {
        credentialId: result.id,
        metadata: result.metadata,
        message: 'Credential issued and cryptographically signed',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCredentials(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await credentialService.getUserCredentials(req.user!.id);

    res.status(200).json({
      success: true,
      data: {
        credentials: result,
        count: result.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function shareCredential(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { credentialId, selectedFields, expiryHours } = shareCredentialSchema.parse(req.body);
    const result = await credentialService.createSharePresentation(
      req.user!.id,
      credentialId,
      selectedFields,
      expiryHours
    );

    res.status(201).json({
      success: true,
      data: {
        shareToken: result.shareToken,
        shareUrl: result.shareUrl,
        expiresAt: result.expiresAt,
        message: 'Verifiable presentation created',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSharedPresentation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.params;
    const result = await credentialService.getSharePresentation(token);

    if (!result) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Presentation not found or expired' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { presentation: result },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyCredential(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { shareToken } = verifyCredentialSchema.parse(req.body);
    const result = await credentialService.getSharePresentation(shareToken);

    if (!result) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Presentation not found or expired' },
      });
      return;
    }

    const presentation = result as unknown as VerifiablePresentation;
    const verificationResult = await verifyPresentation(presentation);

    res.status(200).json({
      success: true,
      data: verificationResult,
    });
  } catch (err) {
    next(err);
  }
}
