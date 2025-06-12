interface ClientWithUser {
  id: string;
  companyName: string;
  registrationNo: string | null;
  companySector: string | null;
  companySize: string | null;
  website: string | null;
  designation: string | null;
  createdAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  requirements: {
    id: string;
  }[];
  documents?: ClientDocument[];
}

interface ClientDocument {
  id: string;
  type: string;
  url: string;
  verified: boolean;
  createdAt: Date;
}
export type AuditLog = {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  description: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  affectedFields: string[];
  ipAddress: string | null;
  userAgent: string | null;
  performedAt: Date;
  createdAt: Date;
  performedById: string;
  performedBy: Pick<User, "id" | "name" | "email">;
};

export type CompanySector =
  | "IT"
  | "REAL_ESTATE"
  | "HEALTHCARE"
  | "FINANCE"
  | "MANUFACTURING"
  | "RETAIL"
  | "CONSTRUCTION"
  | "EDUCATION"
  | "OTHER";

export type CompanySize = "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";

export interface AuthenticatedRequest extends NextRequest {
  user: Session["user"];
}

export interface ValidatedRequest<Schema extends ZodTypeAny>
  extends NextRequest {
  data: zodInfer<Schema>;
}

export type Handler<Params = unknown> = (
  req: NextRequest,
  params?: Params
) => Promise<NextResponse>;

export type AuthenticatedHandler<Params = unknown> = (
  req: AuthenticatedRequest,
  params?: Params
) => Promise<NextResponse>;

export type ValidatedHandler<
  Schema extends ZodTypeAny = ZodTypeAny,
  Params = unknown,
> = (req: ValidatedRequest<Schema>, params?: Params) => Promise<NextResponse>;
