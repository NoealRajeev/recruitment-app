
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model RolePermission
 * 
 */
export type RolePermission = $Result.DefaultSelection<Prisma.$RolePermissionPayload>
/**
 * Model LabourRequest
 * 
 */
export type LabourRequest = $Result.DefaultSelection<Prisma.$LabourRequestPayload>
/**
 * Model Agency
 * 
 */
export type Agency = $Result.DefaultSelection<Prisma.$AgencyPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Candidate
 * 
 */
export type Candidate = $Result.DefaultSelection<Prisma.$CandidatePayload>
/**
 * Model Procedure
 * 
 */
export type Procedure = $Result.DefaultSelection<Prisma.$ProcedurePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  RECRUITMENT_ADMIN: 'RECRUITMENT_ADMIN',
  CLIENT_ADMIN: 'CLIENT_ADMIN',
  RECRUITMENT_AGENCY: 'RECRUITMENT_AGENCY'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const Permission: {
  REQUEST_CREATE: 'REQUEST_CREATE',
  REQUEST_READ: 'REQUEST_READ',
  REQUEST_UPDATE: 'REQUEST_UPDATE',
  REQUEST_DELETE: 'REQUEST_DELETE',
  REQUEST_MANAGE_ALL: 'REQUEST_MANAGE_ALL',
  CANDIDATE_CREATE: 'CANDIDATE_CREATE',
  CANDIDATE_READ: 'CANDIDATE_READ',
  CANDIDATE_UPDATE: 'CANDIDATE_UPDATE',
  CANDIDATE_DELETE: 'CANDIDATE_DELETE',
  CANDIDATE_MANAGE_ALL: 'CANDIDATE_MANAGE_ALL',
  PROCEDURE_CREATE: 'PROCEDURE_CREATE',
  PROCEDURE_READ: 'PROCEDURE_READ',
  PROCEDURE_UPDATE: 'PROCEDURE_UPDATE',
  PROCEDURE_DELETE: 'PROCEDURE_DELETE',
  AGENCY_CREATE: 'AGENCY_CREATE',
  AGENCY_READ: 'AGENCY_READ',
  AGENCY_UPDATE: 'AGENCY_UPDATE',
  AGENCY_DELETE: 'AGENCY_DELETE',
  USER_CREATE: 'USER_CREATE',
  USER_READ: 'USER_READ',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  DASHBOARD_ACCESS: 'DASHBOARD_ACCESS'
};

export type Permission = (typeof Permission)[keyof typeof Permission]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type Permission = $Enums.Permission

export const Permission: typeof $Enums.Permission

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more RolePermissions
 * const rolePermissions = await prisma.rolePermission.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more RolePermissions
   * const rolePermissions = await prisma.rolePermission.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.rolePermission`: Exposes CRUD operations for the **RolePermission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RolePermissions
    * const rolePermissions = await prisma.rolePermission.findMany()
    * ```
    */
  get rolePermission(): Prisma.RolePermissionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.labourRequest`: Exposes CRUD operations for the **LabourRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LabourRequests
    * const labourRequests = await prisma.labourRequest.findMany()
    * ```
    */
  get labourRequest(): Prisma.LabourRequestDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agency`: Exposes CRUD operations for the **Agency** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Agencies
    * const agencies = await prisma.agency.findMany()
    * ```
    */
  get agency(): Prisma.AgencyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.candidate`: Exposes CRUD operations for the **Candidate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Candidates
    * const candidates = await prisma.candidate.findMany()
    * ```
    */
  get candidate(): Prisma.CandidateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.procedure`: Exposes CRUD operations for the **Procedure** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Procedures
    * const procedures = await prisma.procedure.findMany()
    * ```
    */
  get procedure(): Prisma.ProcedureDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    RolePermission: 'RolePermission',
    LabourRequest: 'LabourRequest',
    Agency: 'Agency',
    User: 'User',
    Candidate: 'Candidate',
    Procedure: 'Procedure'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "rolePermission" | "labourRequest" | "agency" | "user" | "candidate" | "procedure"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      RolePermission: {
        payload: Prisma.$RolePermissionPayload<ExtArgs>
        fields: Prisma.RolePermissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RolePermissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RolePermissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          findFirst: {
            args: Prisma.RolePermissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RolePermissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          findMany: {
            args: Prisma.RolePermissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>[]
          }
          create: {
            args: Prisma.RolePermissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          createMany: {
            args: Prisma.RolePermissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RolePermissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>[]
          }
          delete: {
            args: Prisma.RolePermissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          update: {
            args: Prisma.RolePermissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          deleteMany: {
            args: Prisma.RolePermissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RolePermissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RolePermissionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>[]
          }
          upsert: {
            args: Prisma.RolePermissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          aggregate: {
            args: Prisma.RolePermissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRolePermission>
          }
          groupBy: {
            args: Prisma.RolePermissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<RolePermissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.RolePermissionCountArgs<ExtArgs>
            result: $Utils.Optional<RolePermissionCountAggregateOutputType> | number
          }
        }
      }
      LabourRequest: {
        payload: Prisma.$LabourRequestPayload<ExtArgs>
        fields: Prisma.LabourRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LabourRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LabourRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload>
          }
          findFirst: {
            args: Prisma.LabourRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LabourRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload>
          }
          findMany: {
            args: Prisma.LabourRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload>[]
          }
          create: {
            args: Prisma.LabourRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload>
          }
          createMany: {
            args: Prisma.LabourRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LabourRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload>[]
          }
          delete: {
            args: Prisma.LabourRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload>
          }
          update: {
            args: Prisma.LabourRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload>
          }
          deleteMany: {
            args: Prisma.LabourRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LabourRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LabourRequestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload>[]
          }
          upsert: {
            args: Prisma.LabourRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabourRequestPayload>
          }
          aggregate: {
            args: Prisma.LabourRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLabourRequest>
          }
          groupBy: {
            args: Prisma.LabourRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<LabourRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.LabourRequestCountArgs<ExtArgs>
            result: $Utils.Optional<LabourRequestCountAggregateOutputType> | number
          }
        }
      }
      Agency: {
        payload: Prisma.$AgencyPayload<ExtArgs>
        fields: Prisma.AgencyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgencyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgencyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          findFirst: {
            args: Prisma.AgencyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgencyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          findMany: {
            args: Prisma.AgencyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>[]
          }
          create: {
            args: Prisma.AgencyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          createMany: {
            args: Prisma.AgencyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgencyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>[]
          }
          delete: {
            args: Prisma.AgencyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          update: {
            args: Prisma.AgencyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          deleteMany: {
            args: Prisma.AgencyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgencyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgencyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>[]
          }
          upsert: {
            args: Prisma.AgencyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          aggregate: {
            args: Prisma.AgencyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgency>
          }
          groupBy: {
            args: Prisma.AgencyGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgencyGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgencyCountArgs<ExtArgs>
            result: $Utils.Optional<AgencyCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Candidate: {
        payload: Prisma.$CandidatePayload<ExtArgs>
        fields: Prisma.CandidateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CandidateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CandidateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          findFirst: {
            args: Prisma.CandidateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CandidateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          findMany: {
            args: Prisma.CandidateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>[]
          }
          create: {
            args: Prisma.CandidateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          createMany: {
            args: Prisma.CandidateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CandidateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>[]
          }
          delete: {
            args: Prisma.CandidateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          update: {
            args: Prisma.CandidateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          deleteMany: {
            args: Prisma.CandidateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CandidateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CandidateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>[]
          }
          upsert: {
            args: Prisma.CandidateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          aggregate: {
            args: Prisma.CandidateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCandidate>
          }
          groupBy: {
            args: Prisma.CandidateGroupByArgs<ExtArgs>
            result: $Utils.Optional<CandidateGroupByOutputType>[]
          }
          count: {
            args: Prisma.CandidateCountArgs<ExtArgs>
            result: $Utils.Optional<CandidateCountAggregateOutputType> | number
          }
        }
      }
      Procedure: {
        payload: Prisma.$ProcedurePayload<ExtArgs>
        fields: Prisma.ProcedureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcedureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcedureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          findFirst: {
            args: Prisma.ProcedureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcedureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          findMany: {
            args: Prisma.ProcedureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>[]
          }
          create: {
            args: Prisma.ProcedureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          createMany: {
            args: Prisma.ProcedureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcedureCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>[]
          }
          delete: {
            args: Prisma.ProcedureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          update: {
            args: Prisma.ProcedureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          deleteMany: {
            args: Prisma.ProcedureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcedureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProcedureUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>[]
          }
          upsert: {
            args: Prisma.ProcedureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          aggregate: {
            args: Prisma.ProcedureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcedure>
          }
          groupBy: {
            args: Prisma.ProcedureGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcedureGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcedureCountArgs<ExtArgs>
            result: $Utils.Optional<ProcedureCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    rolePermission?: RolePermissionOmit
    labourRequest?: LabourRequestOmit
    agency?: AgencyOmit
    user?: UserOmit
    candidate?: CandidateOmit
    procedure?: ProcedureOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type LabourRequestCountOutputType
   */

  export type LabourRequestCountOutputType = {
    candidates: number
    procedures: number
  }

  export type LabourRequestCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidates?: boolean | LabourRequestCountOutputTypeCountCandidatesArgs
    procedures?: boolean | LabourRequestCountOutputTypeCountProceduresArgs
  }

  // Custom InputTypes
  /**
   * LabourRequestCountOutputType without action
   */
  export type LabourRequestCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequestCountOutputType
     */
    select?: LabourRequestCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LabourRequestCountOutputType without action
   */
  export type LabourRequestCountOutputTypeCountCandidatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CandidateWhereInput
  }

  /**
   * LabourRequestCountOutputType without action
   */
  export type LabourRequestCountOutputTypeCountProceduresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcedureWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    permissions: number
    labourRequests: number
    agencies: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    permissions?: boolean | UserCountOutputTypeCountPermissionsArgs
    labourRequests?: boolean | UserCountOutputTypeCountLabourRequestsArgs
    agencies?: boolean | UserCountOutputTypeCountAgenciesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPermissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RolePermissionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLabourRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LabourRequestWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAgenciesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgencyWhereInput
  }


  /**
   * Models
   */

  /**
   * Model RolePermission
   */

  export type AggregateRolePermission = {
    _count: RolePermissionCountAggregateOutputType | null
    _min: RolePermissionMinAggregateOutputType | null
    _max: RolePermissionMaxAggregateOutputType | null
  }

  export type RolePermissionMinAggregateOutputType = {
    id: string | null
    role: $Enums.UserRole | null
    permission: $Enums.Permission | null
    createdAt: Date | null
    userId: string | null
  }

  export type RolePermissionMaxAggregateOutputType = {
    id: string | null
    role: $Enums.UserRole | null
    permission: $Enums.Permission | null
    createdAt: Date | null
    userId: string | null
  }

  export type RolePermissionCountAggregateOutputType = {
    id: number
    role: number
    permission: number
    createdAt: number
    userId: number
    _all: number
  }


  export type RolePermissionMinAggregateInputType = {
    id?: true
    role?: true
    permission?: true
    createdAt?: true
    userId?: true
  }

  export type RolePermissionMaxAggregateInputType = {
    id?: true
    role?: true
    permission?: true
    createdAt?: true
    userId?: true
  }

  export type RolePermissionCountAggregateInputType = {
    id?: true
    role?: true
    permission?: true
    createdAt?: true
    userId?: true
    _all?: true
  }

  export type RolePermissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RolePermission to aggregate.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RolePermissions
    **/
    _count?: true | RolePermissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RolePermissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RolePermissionMaxAggregateInputType
  }

  export type GetRolePermissionAggregateType<T extends RolePermissionAggregateArgs> = {
        [P in keyof T & keyof AggregateRolePermission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRolePermission[P]>
      : GetScalarType<T[P], AggregateRolePermission[P]>
  }




  export type RolePermissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RolePermissionWhereInput
    orderBy?: RolePermissionOrderByWithAggregationInput | RolePermissionOrderByWithAggregationInput[]
    by: RolePermissionScalarFieldEnum[] | RolePermissionScalarFieldEnum
    having?: RolePermissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RolePermissionCountAggregateInputType | true
    _min?: RolePermissionMinAggregateInputType
    _max?: RolePermissionMaxAggregateInputType
  }

  export type RolePermissionGroupByOutputType = {
    id: string
    role: $Enums.UserRole
    permission: $Enums.Permission
    createdAt: Date
    userId: string | null
    _count: RolePermissionCountAggregateOutputType | null
    _min: RolePermissionMinAggregateOutputType | null
    _max: RolePermissionMaxAggregateOutputType | null
  }

  type GetRolePermissionGroupByPayload<T extends RolePermissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RolePermissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RolePermissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RolePermissionGroupByOutputType[P]>
            : GetScalarType<T[P], RolePermissionGroupByOutputType[P]>
        }
      >
    >


  export type RolePermissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    permission?: boolean
    createdAt?: boolean
    userId?: boolean
    user?: boolean | RolePermission$userArgs<ExtArgs>
  }, ExtArgs["result"]["rolePermission"]>

  export type RolePermissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    permission?: boolean
    createdAt?: boolean
    userId?: boolean
    user?: boolean | RolePermission$userArgs<ExtArgs>
  }, ExtArgs["result"]["rolePermission"]>

  export type RolePermissionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    permission?: boolean
    createdAt?: boolean
    userId?: boolean
    user?: boolean | RolePermission$userArgs<ExtArgs>
  }, ExtArgs["result"]["rolePermission"]>

  export type RolePermissionSelectScalar = {
    id?: boolean
    role?: boolean
    permission?: boolean
    createdAt?: boolean
    userId?: boolean
  }

  export type RolePermissionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "role" | "permission" | "createdAt" | "userId", ExtArgs["result"]["rolePermission"]>
  export type RolePermissionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | RolePermission$userArgs<ExtArgs>
  }
  export type RolePermissionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | RolePermission$userArgs<ExtArgs>
  }
  export type RolePermissionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | RolePermission$userArgs<ExtArgs>
  }

  export type $RolePermissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RolePermission"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      role: $Enums.UserRole
      permission: $Enums.Permission
      createdAt: Date
      userId: string | null
    }, ExtArgs["result"]["rolePermission"]>
    composites: {}
  }

  type RolePermissionGetPayload<S extends boolean | null | undefined | RolePermissionDefaultArgs> = $Result.GetResult<Prisma.$RolePermissionPayload, S>

  type RolePermissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RolePermissionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RolePermissionCountAggregateInputType | true
    }

  export interface RolePermissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RolePermission'], meta: { name: 'RolePermission' } }
    /**
     * Find zero or one RolePermission that matches the filter.
     * @param {RolePermissionFindUniqueArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RolePermissionFindUniqueArgs>(args: SelectSubset<T, RolePermissionFindUniqueArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RolePermission that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RolePermissionFindUniqueOrThrowArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RolePermissionFindUniqueOrThrowArgs>(args: SelectSubset<T, RolePermissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RolePermission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionFindFirstArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RolePermissionFindFirstArgs>(args?: SelectSubset<T, RolePermissionFindFirstArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RolePermission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionFindFirstOrThrowArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RolePermissionFindFirstOrThrowArgs>(args?: SelectSubset<T, RolePermissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RolePermissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RolePermissions
     * const rolePermissions = await prisma.rolePermission.findMany()
     * 
     * // Get first 10 RolePermissions
     * const rolePermissions = await prisma.rolePermission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rolePermissionWithIdOnly = await prisma.rolePermission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RolePermissionFindManyArgs>(args?: SelectSubset<T, RolePermissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RolePermission.
     * @param {RolePermissionCreateArgs} args - Arguments to create a RolePermission.
     * @example
     * // Create one RolePermission
     * const RolePermission = await prisma.rolePermission.create({
     *   data: {
     *     // ... data to create a RolePermission
     *   }
     * })
     * 
     */
    create<T extends RolePermissionCreateArgs>(args: SelectSubset<T, RolePermissionCreateArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RolePermissions.
     * @param {RolePermissionCreateManyArgs} args - Arguments to create many RolePermissions.
     * @example
     * // Create many RolePermissions
     * const rolePermission = await prisma.rolePermission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RolePermissionCreateManyArgs>(args?: SelectSubset<T, RolePermissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RolePermissions and returns the data saved in the database.
     * @param {RolePermissionCreateManyAndReturnArgs} args - Arguments to create many RolePermissions.
     * @example
     * // Create many RolePermissions
     * const rolePermission = await prisma.rolePermission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RolePermissions and only return the `id`
     * const rolePermissionWithIdOnly = await prisma.rolePermission.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RolePermissionCreateManyAndReturnArgs>(args?: SelectSubset<T, RolePermissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RolePermission.
     * @param {RolePermissionDeleteArgs} args - Arguments to delete one RolePermission.
     * @example
     * // Delete one RolePermission
     * const RolePermission = await prisma.rolePermission.delete({
     *   where: {
     *     // ... filter to delete one RolePermission
     *   }
     * })
     * 
     */
    delete<T extends RolePermissionDeleteArgs>(args: SelectSubset<T, RolePermissionDeleteArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RolePermission.
     * @param {RolePermissionUpdateArgs} args - Arguments to update one RolePermission.
     * @example
     * // Update one RolePermission
     * const rolePermission = await prisma.rolePermission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RolePermissionUpdateArgs>(args: SelectSubset<T, RolePermissionUpdateArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RolePermissions.
     * @param {RolePermissionDeleteManyArgs} args - Arguments to filter RolePermissions to delete.
     * @example
     * // Delete a few RolePermissions
     * const { count } = await prisma.rolePermission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RolePermissionDeleteManyArgs>(args?: SelectSubset<T, RolePermissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RolePermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RolePermissions
     * const rolePermission = await prisma.rolePermission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RolePermissionUpdateManyArgs>(args: SelectSubset<T, RolePermissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RolePermissions and returns the data updated in the database.
     * @param {RolePermissionUpdateManyAndReturnArgs} args - Arguments to update many RolePermissions.
     * @example
     * // Update many RolePermissions
     * const rolePermission = await prisma.rolePermission.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RolePermissions and only return the `id`
     * const rolePermissionWithIdOnly = await prisma.rolePermission.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RolePermissionUpdateManyAndReturnArgs>(args: SelectSubset<T, RolePermissionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RolePermission.
     * @param {RolePermissionUpsertArgs} args - Arguments to update or create a RolePermission.
     * @example
     * // Update or create a RolePermission
     * const rolePermission = await prisma.rolePermission.upsert({
     *   create: {
     *     // ... data to create a RolePermission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RolePermission we want to update
     *   }
     * })
     */
    upsert<T extends RolePermissionUpsertArgs>(args: SelectSubset<T, RolePermissionUpsertArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RolePermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionCountArgs} args - Arguments to filter RolePermissions to count.
     * @example
     * // Count the number of RolePermissions
     * const count = await prisma.rolePermission.count({
     *   where: {
     *     // ... the filter for the RolePermissions we want to count
     *   }
     * })
    **/
    count<T extends RolePermissionCountArgs>(
      args?: Subset<T, RolePermissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RolePermissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RolePermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RolePermissionAggregateArgs>(args: Subset<T, RolePermissionAggregateArgs>): Prisma.PrismaPromise<GetRolePermissionAggregateType<T>>

    /**
     * Group by RolePermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RolePermissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RolePermissionGroupByArgs['orderBy'] }
        : { orderBy?: RolePermissionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RolePermissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRolePermissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RolePermission model
   */
  readonly fields: RolePermissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RolePermission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RolePermissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends RolePermission$userArgs<ExtArgs> = {}>(args?: Subset<T, RolePermission$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RolePermission model
   */
  interface RolePermissionFieldRefs {
    readonly id: FieldRef<"RolePermission", 'String'>
    readonly role: FieldRef<"RolePermission", 'UserRole'>
    readonly permission: FieldRef<"RolePermission", 'Permission'>
    readonly createdAt: FieldRef<"RolePermission", 'DateTime'>
    readonly userId: FieldRef<"RolePermission", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RolePermission findUnique
   */
  export type RolePermissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission findUniqueOrThrow
   */
  export type RolePermissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission findFirst
   */
  export type RolePermissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RolePermissions.
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RolePermissions.
     */
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * RolePermission findFirstOrThrow
   */
  export type RolePermissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RolePermissions.
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RolePermissions.
     */
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * RolePermission findMany
   */
  export type RolePermissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermissions to fetch.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RolePermissions.
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * RolePermission create
   */
  export type RolePermissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * The data needed to create a RolePermission.
     */
    data: XOR<RolePermissionCreateInput, RolePermissionUncheckedCreateInput>
  }

  /**
   * RolePermission createMany
   */
  export type RolePermissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RolePermissions.
     */
    data: RolePermissionCreateManyInput | RolePermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RolePermission createManyAndReturn
   */
  export type RolePermissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * The data used to create many RolePermissions.
     */
    data: RolePermissionCreateManyInput | RolePermissionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RolePermission update
   */
  export type RolePermissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * The data needed to update a RolePermission.
     */
    data: XOR<RolePermissionUpdateInput, RolePermissionUncheckedUpdateInput>
    /**
     * Choose, which RolePermission to update.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission updateMany
   */
  export type RolePermissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RolePermissions.
     */
    data: XOR<RolePermissionUpdateManyMutationInput, RolePermissionUncheckedUpdateManyInput>
    /**
     * Filter which RolePermissions to update
     */
    where?: RolePermissionWhereInput
    /**
     * Limit how many RolePermissions to update.
     */
    limit?: number
  }

  /**
   * RolePermission updateManyAndReturn
   */
  export type RolePermissionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * The data used to update RolePermissions.
     */
    data: XOR<RolePermissionUpdateManyMutationInput, RolePermissionUncheckedUpdateManyInput>
    /**
     * Filter which RolePermissions to update
     */
    where?: RolePermissionWhereInput
    /**
     * Limit how many RolePermissions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RolePermission upsert
   */
  export type RolePermissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * The filter to search for the RolePermission to update in case it exists.
     */
    where: RolePermissionWhereUniqueInput
    /**
     * In case the RolePermission found by the `where` argument doesn't exist, create a new RolePermission with this data.
     */
    create: XOR<RolePermissionCreateInput, RolePermissionUncheckedCreateInput>
    /**
     * In case the RolePermission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RolePermissionUpdateInput, RolePermissionUncheckedUpdateInput>
  }

  /**
   * RolePermission delete
   */
  export type RolePermissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter which RolePermission to delete.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission deleteMany
   */
  export type RolePermissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RolePermissions to delete
     */
    where?: RolePermissionWhereInput
    /**
     * Limit how many RolePermissions to delete.
     */
    limit?: number
  }

  /**
   * RolePermission.user
   */
  export type RolePermission$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * RolePermission without action
   */
  export type RolePermissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
  }


  /**
   * Model LabourRequest
   */

  export type AggregateLabourRequest = {
    _count: LabourRequestCountAggregateOutputType | null
    _avg: LabourRequestAvgAggregateOutputType | null
    _sum: LabourRequestSumAggregateOutputType | null
    _min: LabourRequestMinAggregateOutputType | null
    _max: LabourRequestMaxAggregateOutputType | null
  }

  export type LabourRequestAvgAggregateOutputType = {
    salary: number | null
    quantity: number | null
  }

  export type LabourRequestSumAggregateOutputType = {
    salary: number | null
    quantity: number | null
  }

  export type LabourRequestMinAggregateOutputType = {
    id: string | null
    jobTitle: string | null
    nationality: string | null
    salary: number | null
    quantity: number | null
    requirements: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type LabourRequestMaxAggregateOutputType = {
    id: string | null
    jobTitle: string | null
    nationality: string | null
    salary: number | null
    quantity: number | null
    requirements: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type LabourRequestCountAggregateOutputType = {
    id: number
    jobTitle: number
    nationality: number
    salary: number
    quantity: number
    requirements: number
    status: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type LabourRequestAvgAggregateInputType = {
    salary?: true
    quantity?: true
  }

  export type LabourRequestSumAggregateInputType = {
    salary?: true
    quantity?: true
  }

  export type LabourRequestMinAggregateInputType = {
    id?: true
    jobTitle?: true
    nationality?: true
    salary?: true
    quantity?: true
    requirements?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type LabourRequestMaxAggregateInputType = {
    id?: true
    jobTitle?: true
    nationality?: true
    salary?: true
    quantity?: true
    requirements?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type LabourRequestCountAggregateInputType = {
    id?: true
    jobTitle?: true
    nationality?: true
    salary?: true
    quantity?: true
    requirements?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type LabourRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LabourRequest to aggregate.
     */
    where?: LabourRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LabourRequests to fetch.
     */
    orderBy?: LabourRequestOrderByWithRelationInput | LabourRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LabourRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LabourRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LabourRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LabourRequests
    **/
    _count?: true | LabourRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LabourRequestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LabourRequestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LabourRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LabourRequestMaxAggregateInputType
  }

  export type GetLabourRequestAggregateType<T extends LabourRequestAggregateArgs> = {
        [P in keyof T & keyof AggregateLabourRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLabourRequest[P]>
      : GetScalarType<T[P], AggregateLabourRequest[P]>
  }




  export type LabourRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LabourRequestWhereInput
    orderBy?: LabourRequestOrderByWithAggregationInput | LabourRequestOrderByWithAggregationInput[]
    by: LabourRequestScalarFieldEnum[] | LabourRequestScalarFieldEnum
    having?: LabourRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LabourRequestCountAggregateInputType | true
    _avg?: LabourRequestAvgAggregateInputType
    _sum?: LabourRequestSumAggregateInputType
    _min?: LabourRequestMinAggregateInputType
    _max?: LabourRequestMaxAggregateInputType
  }

  export type LabourRequestGroupByOutputType = {
    id: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status: string
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: LabourRequestCountAggregateOutputType | null
    _avg: LabourRequestAvgAggregateOutputType | null
    _sum: LabourRequestSumAggregateOutputType | null
    _min: LabourRequestMinAggregateOutputType | null
    _max: LabourRequestMaxAggregateOutputType | null
  }

  type GetLabourRequestGroupByPayload<T extends LabourRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LabourRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LabourRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LabourRequestGroupByOutputType[P]>
            : GetScalarType<T[P], LabourRequestGroupByOutputType[P]>
        }
      >
    >


  export type LabourRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobTitle?: boolean
    nationality?: boolean
    salary?: boolean
    quantity?: boolean
    requirements?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    candidates?: boolean | LabourRequest$candidatesArgs<ExtArgs>
    procedures?: boolean | LabourRequest$proceduresArgs<ExtArgs>
    _count?: boolean | LabourRequestCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["labourRequest"]>

  export type LabourRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobTitle?: boolean
    nationality?: boolean
    salary?: boolean
    quantity?: boolean
    requirements?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["labourRequest"]>

  export type LabourRequestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobTitle?: boolean
    nationality?: boolean
    salary?: boolean
    quantity?: boolean
    requirements?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["labourRequest"]>

  export type LabourRequestSelectScalar = {
    id?: boolean
    jobTitle?: boolean
    nationality?: boolean
    salary?: boolean
    quantity?: boolean
    requirements?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type LabourRequestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "jobTitle" | "nationality" | "salary" | "quantity" | "requirements" | "status" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["labourRequest"]>
  export type LabourRequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    candidates?: boolean | LabourRequest$candidatesArgs<ExtArgs>
    procedures?: boolean | LabourRequest$proceduresArgs<ExtArgs>
    _count?: boolean | LabourRequestCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LabourRequestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type LabourRequestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $LabourRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LabourRequest"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      candidates: Prisma.$CandidatePayload<ExtArgs>[]
      procedures: Prisma.$ProcedurePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      jobTitle: string
      nationality: string
      salary: number
      quantity: number
      requirements: string
      status: string
      createdAt: Date
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["labourRequest"]>
    composites: {}
  }

  type LabourRequestGetPayload<S extends boolean | null | undefined | LabourRequestDefaultArgs> = $Result.GetResult<Prisma.$LabourRequestPayload, S>

  type LabourRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LabourRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LabourRequestCountAggregateInputType | true
    }

  export interface LabourRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LabourRequest'], meta: { name: 'LabourRequest' } }
    /**
     * Find zero or one LabourRequest that matches the filter.
     * @param {LabourRequestFindUniqueArgs} args - Arguments to find a LabourRequest
     * @example
     * // Get one LabourRequest
     * const labourRequest = await prisma.labourRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LabourRequestFindUniqueArgs>(args: SelectSubset<T, LabourRequestFindUniqueArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LabourRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LabourRequestFindUniqueOrThrowArgs} args - Arguments to find a LabourRequest
     * @example
     * // Get one LabourRequest
     * const labourRequest = await prisma.labourRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LabourRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, LabourRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LabourRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabourRequestFindFirstArgs} args - Arguments to find a LabourRequest
     * @example
     * // Get one LabourRequest
     * const labourRequest = await prisma.labourRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LabourRequestFindFirstArgs>(args?: SelectSubset<T, LabourRequestFindFirstArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LabourRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabourRequestFindFirstOrThrowArgs} args - Arguments to find a LabourRequest
     * @example
     * // Get one LabourRequest
     * const labourRequest = await prisma.labourRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LabourRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, LabourRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LabourRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabourRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LabourRequests
     * const labourRequests = await prisma.labourRequest.findMany()
     * 
     * // Get first 10 LabourRequests
     * const labourRequests = await prisma.labourRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const labourRequestWithIdOnly = await prisma.labourRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LabourRequestFindManyArgs>(args?: SelectSubset<T, LabourRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LabourRequest.
     * @param {LabourRequestCreateArgs} args - Arguments to create a LabourRequest.
     * @example
     * // Create one LabourRequest
     * const LabourRequest = await prisma.labourRequest.create({
     *   data: {
     *     // ... data to create a LabourRequest
     *   }
     * })
     * 
     */
    create<T extends LabourRequestCreateArgs>(args: SelectSubset<T, LabourRequestCreateArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LabourRequests.
     * @param {LabourRequestCreateManyArgs} args - Arguments to create many LabourRequests.
     * @example
     * // Create many LabourRequests
     * const labourRequest = await prisma.labourRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LabourRequestCreateManyArgs>(args?: SelectSubset<T, LabourRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LabourRequests and returns the data saved in the database.
     * @param {LabourRequestCreateManyAndReturnArgs} args - Arguments to create many LabourRequests.
     * @example
     * // Create many LabourRequests
     * const labourRequest = await prisma.labourRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LabourRequests and only return the `id`
     * const labourRequestWithIdOnly = await prisma.labourRequest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LabourRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, LabourRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LabourRequest.
     * @param {LabourRequestDeleteArgs} args - Arguments to delete one LabourRequest.
     * @example
     * // Delete one LabourRequest
     * const LabourRequest = await prisma.labourRequest.delete({
     *   where: {
     *     // ... filter to delete one LabourRequest
     *   }
     * })
     * 
     */
    delete<T extends LabourRequestDeleteArgs>(args: SelectSubset<T, LabourRequestDeleteArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LabourRequest.
     * @param {LabourRequestUpdateArgs} args - Arguments to update one LabourRequest.
     * @example
     * // Update one LabourRequest
     * const labourRequest = await prisma.labourRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LabourRequestUpdateArgs>(args: SelectSubset<T, LabourRequestUpdateArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LabourRequests.
     * @param {LabourRequestDeleteManyArgs} args - Arguments to filter LabourRequests to delete.
     * @example
     * // Delete a few LabourRequests
     * const { count } = await prisma.labourRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LabourRequestDeleteManyArgs>(args?: SelectSubset<T, LabourRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LabourRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabourRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LabourRequests
     * const labourRequest = await prisma.labourRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LabourRequestUpdateManyArgs>(args: SelectSubset<T, LabourRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LabourRequests and returns the data updated in the database.
     * @param {LabourRequestUpdateManyAndReturnArgs} args - Arguments to update many LabourRequests.
     * @example
     * // Update many LabourRequests
     * const labourRequest = await prisma.labourRequest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LabourRequests and only return the `id`
     * const labourRequestWithIdOnly = await prisma.labourRequest.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LabourRequestUpdateManyAndReturnArgs>(args: SelectSubset<T, LabourRequestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LabourRequest.
     * @param {LabourRequestUpsertArgs} args - Arguments to update or create a LabourRequest.
     * @example
     * // Update or create a LabourRequest
     * const labourRequest = await prisma.labourRequest.upsert({
     *   create: {
     *     // ... data to create a LabourRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LabourRequest we want to update
     *   }
     * })
     */
    upsert<T extends LabourRequestUpsertArgs>(args: SelectSubset<T, LabourRequestUpsertArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LabourRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabourRequestCountArgs} args - Arguments to filter LabourRequests to count.
     * @example
     * // Count the number of LabourRequests
     * const count = await prisma.labourRequest.count({
     *   where: {
     *     // ... the filter for the LabourRequests we want to count
     *   }
     * })
    **/
    count<T extends LabourRequestCountArgs>(
      args?: Subset<T, LabourRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LabourRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LabourRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabourRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LabourRequestAggregateArgs>(args: Subset<T, LabourRequestAggregateArgs>): Prisma.PrismaPromise<GetLabourRequestAggregateType<T>>

    /**
     * Group by LabourRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabourRequestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LabourRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LabourRequestGroupByArgs['orderBy'] }
        : { orderBy?: LabourRequestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LabourRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLabourRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LabourRequest model
   */
  readonly fields: LabourRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LabourRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LabourRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    candidates<T extends LabourRequest$candidatesArgs<ExtArgs> = {}>(args?: Subset<T, LabourRequest$candidatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    procedures<T extends LabourRequest$proceduresArgs<ExtArgs> = {}>(args?: Subset<T, LabourRequest$proceduresArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LabourRequest model
   */
  interface LabourRequestFieldRefs {
    readonly id: FieldRef<"LabourRequest", 'String'>
    readonly jobTitle: FieldRef<"LabourRequest", 'String'>
    readonly nationality: FieldRef<"LabourRequest", 'String'>
    readonly salary: FieldRef<"LabourRequest", 'Float'>
    readonly quantity: FieldRef<"LabourRequest", 'Int'>
    readonly requirements: FieldRef<"LabourRequest", 'String'>
    readonly status: FieldRef<"LabourRequest", 'String'>
    readonly createdAt: FieldRef<"LabourRequest", 'DateTime'>
    readonly updatedAt: FieldRef<"LabourRequest", 'DateTime'>
    readonly userId: FieldRef<"LabourRequest", 'String'>
  }
    

  // Custom InputTypes
  /**
   * LabourRequest findUnique
   */
  export type LabourRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    /**
     * Filter, which LabourRequest to fetch.
     */
    where: LabourRequestWhereUniqueInput
  }

  /**
   * LabourRequest findUniqueOrThrow
   */
  export type LabourRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    /**
     * Filter, which LabourRequest to fetch.
     */
    where: LabourRequestWhereUniqueInput
  }

  /**
   * LabourRequest findFirst
   */
  export type LabourRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    /**
     * Filter, which LabourRequest to fetch.
     */
    where?: LabourRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LabourRequests to fetch.
     */
    orderBy?: LabourRequestOrderByWithRelationInput | LabourRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LabourRequests.
     */
    cursor?: LabourRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LabourRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LabourRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LabourRequests.
     */
    distinct?: LabourRequestScalarFieldEnum | LabourRequestScalarFieldEnum[]
  }

  /**
   * LabourRequest findFirstOrThrow
   */
  export type LabourRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    /**
     * Filter, which LabourRequest to fetch.
     */
    where?: LabourRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LabourRequests to fetch.
     */
    orderBy?: LabourRequestOrderByWithRelationInput | LabourRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LabourRequests.
     */
    cursor?: LabourRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LabourRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LabourRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LabourRequests.
     */
    distinct?: LabourRequestScalarFieldEnum | LabourRequestScalarFieldEnum[]
  }

  /**
   * LabourRequest findMany
   */
  export type LabourRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    /**
     * Filter, which LabourRequests to fetch.
     */
    where?: LabourRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LabourRequests to fetch.
     */
    orderBy?: LabourRequestOrderByWithRelationInput | LabourRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LabourRequests.
     */
    cursor?: LabourRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LabourRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LabourRequests.
     */
    skip?: number
    distinct?: LabourRequestScalarFieldEnum | LabourRequestScalarFieldEnum[]
  }

  /**
   * LabourRequest create
   */
  export type LabourRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    /**
     * The data needed to create a LabourRequest.
     */
    data: XOR<LabourRequestCreateInput, LabourRequestUncheckedCreateInput>
  }

  /**
   * LabourRequest createMany
   */
  export type LabourRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LabourRequests.
     */
    data: LabourRequestCreateManyInput | LabourRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LabourRequest createManyAndReturn
   */
  export type LabourRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * The data used to create many LabourRequests.
     */
    data: LabourRequestCreateManyInput | LabourRequestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LabourRequest update
   */
  export type LabourRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    /**
     * The data needed to update a LabourRequest.
     */
    data: XOR<LabourRequestUpdateInput, LabourRequestUncheckedUpdateInput>
    /**
     * Choose, which LabourRequest to update.
     */
    where: LabourRequestWhereUniqueInput
  }

  /**
   * LabourRequest updateMany
   */
  export type LabourRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LabourRequests.
     */
    data: XOR<LabourRequestUpdateManyMutationInput, LabourRequestUncheckedUpdateManyInput>
    /**
     * Filter which LabourRequests to update
     */
    where?: LabourRequestWhereInput
    /**
     * Limit how many LabourRequests to update.
     */
    limit?: number
  }

  /**
   * LabourRequest updateManyAndReturn
   */
  export type LabourRequestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * The data used to update LabourRequests.
     */
    data: XOR<LabourRequestUpdateManyMutationInput, LabourRequestUncheckedUpdateManyInput>
    /**
     * Filter which LabourRequests to update
     */
    where?: LabourRequestWhereInput
    /**
     * Limit how many LabourRequests to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LabourRequest upsert
   */
  export type LabourRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    /**
     * The filter to search for the LabourRequest to update in case it exists.
     */
    where: LabourRequestWhereUniqueInput
    /**
     * In case the LabourRequest found by the `where` argument doesn't exist, create a new LabourRequest with this data.
     */
    create: XOR<LabourRequestCreateInput, LabourRequestUncheckedCreateInput>
    /**
     * In case the LabourRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LabourRequestUpdateInput, LabourRequestUncheckedUpdateInput>
  }

  /**
   * LabourRequest delete
   */
  export type LabourRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    /**
     * Filter which LabourRequest to delete.
     */
    where: LabourRequestWhereUniqueInput
  }

  /**
   * LabourRequest deleteMany
   */
  export type LabourRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LabourRequests to delete
     */
    where?: LabourRequestWhereInput
    /**
     * Limit how many LabourRequests to delete.
     */
    limit?: number
  }

  /**
   * LabourRequest.candidates
   */
  export type LabourRequest$candidatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    where?: CandidateWhereInput
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    cursor?: CandidateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * LabourRequest.procedures
   */
  export type LabourRequest$proceduresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    where?: ProcedureWhereInput
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    cursor?: ProcedureWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProcedureScalarFieldEnum | ProcedureScalarFieldEnum[]
  }

  /**
   * LabourRequest without action
   */
  export type LabourRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
  }


  /**
   * Model Agency
   */

  export type AggregateAgency = {
    _count: AgencyCountAggregateOutputType | null
    _min: AgencyMinAggregateOutputType | null
    _max: AgencyMaxAggregateOutputType | null
  }

  export type AgencyMinAggregateOutputType = {
    id: string | null
    name: string | null
    contact: string | null
    email: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgencyMaxAggregateOutputType = {
    id: string | null
    name: string | null
    contact: string | null
    email: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgencyCountAggregateOutputType = {
    id: number
    name: number
    contact: number
    email: number
    userId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AgencyMinAggregateInputType = {
    id?: true
    name?: true
    contact?: true
    email?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgencyMaxAggregateInputType = {
    id?: true
    name?: true
    contact?: true
    email?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgencyCountAggregateInputType = {
    id?: true
    name?: true
    contact?: true
    email?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AgencyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agency to aggregate.
     */
    where?: AgencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencies to fetch.
     */
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Agencies
    **/
    _count?: true | AgencyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgencyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgencyMaxAggregateInputType
  }

  export type GetAgencyAggregateType<T extends AgencyAggregateArgs> = {
        [P in keyof T & keyof AggregateAgency]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgency[P]>
      : GetScalarType<T[P], AggregateAgency[P]>
  }




  export type AgencyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgencyWhereInput
    orderBy?: AgencyOrderByWithAggregationInput | AgencyOrderByWithAggregationInput[]
    by: AgencyScalarFieldEnum[] | AgencyScalarFieldEnum
    having?: AgencyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgencyCountAggregateInputType | true
    _min?: AgencyMinAggregateInputType
    _max?: AgencyMaxAggregateInputType
  }

  export type AgencyGroupByOutputType = {
    id: string
    name: string
    contact: string
    email: string
    userId: string
    createdAt: Date
    updatedAt: Date
    _count: AgencyCountAggregateOutputType | null
    _min: AgencyMinAggregateOutputType | null
    _max: AgencyMaxAggregateOutputType | null
  }

  type GetAgencyGroupByPayload<T extends AgencyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgencyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgencyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgencyGroupByOutputType[P]>
            : GetScalarType<T[P], AgencyGroupByOutputType[P]>
        }
      >
    >


  export type AgencySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    contact?: boolean
    email?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agency"]>

  export type AgencySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    contact?: boolean
    email?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agency"]>

  export type AgencySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    contact?: boolean
    email?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agency"]>

  export type AgencySelectScalar = {
    id?: boolean
    name?: boolean
    contact?: boolean
    email?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AgencyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "contact" | "email" | "userId" | "createdAt" | "updatedAt", ExtArgs["result"]["agency"]>
  export type AgencyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AgencyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AgencyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AgencyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Agency"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      contact: string
      email: string
      userId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["agency"]>
    composites: {}
  }

  type AgencyGetPayload<S extends boolean | null | undefined | AgencyDefaultArgs> = $Result.GetResult<Prisma.$AgencyPayload, S>

  type AgencyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgencyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgencyCountAggregateInputType | true
    }

  export interface AgencyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Agency'], meta: { name: 'Agency' } }
    /**
     * Find zero or one Agency that matches the filter.
     * @param {AgencyFindUniqueArgs} args - Arguments to find a Agency
     * @example
     * // Get one Agency
     * const agency = await prisma.agency.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgencyFindUniqueArgs>(args: SelectSubset<T, AgencyFindUniqueArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Agency that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgencyFindUniqueOrThrowArgs} args - Arguments to find a Agency
     * @example
     * // Get one Agency
     * const agency = await prisma.agency.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgencyFindUniqueOrThrowArgs>(args: SelectSubset<T, AgencyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agency that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyFindFirstArgs} args - Arguments to find a Agency
     * @example
     * // Get one Agency
     * const agency = await prisma.agency.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgencyFindFirstArgs>(args?: SelectSubset<T, AgencyFindFirstArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agency that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyFindFirstOrThrowArgs} args - Arguments to find a Agency
     * @example
     * // Get one Agency
     * const agency = await prisma.agency.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgencyFindFirstOrThrowArgs>(args?: SelectSubset<T, AgencyFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Agencies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Agencies
     * const agencies = await prisma.agency.findMany()
     * 
     * // Get first 10 Agencies
     * const agencies = await prisma.agency.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agencyWithIdOnly = await prisma.agency.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgencyFindManyArgs>(args?: SelectSubset<T, AgencyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Agency.
     * @param {AgencyCreateArgs} args - Arguments to create a Agency.
     * @example
     * // Create one Agency
     * const Agency = await prisma.agency.create({
     *   data: {
     *     // ... data to create a Agency
     *   }
     * })
     * 
     */
    create<T extends AgencyCreateArgs>(args: SelectSubset<T, AgencyCreateArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Agencies.
     * @param {AgencyCreateManyArgs} args - Arguments to create many Agencies.
     * @example
     * // Create many Agencies
     * const agency = await prisma.agency.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgencyCreateManyArgs>(args?: SelectSubset<T, AgencyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Agencies and returns the data saved in the database.
     * @param {AgencyCreateManyAndReturnArgs} args - Arguments to create many Agencies.
     * @example
     * // Create many Agencies
     * const agency = await prisma.agency.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Agencies and only return the `id`
     * const agencyWithIdOnly = await prisma.agency.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgencyCreateManyAndReturnArgs>(args?: SelectSubset<T, AgencyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Agency.
     * @param {AgencyDeleteArgs} args - Arguments to delete one Agency.
     * @example
     * // Delete one Agency
     * const Agency = await prisma.agency.delete({
     *   where: {
     *     // ... filter to delete one Agency
     *   }
     * })
     * 
     */
    delete<T extends AgencyDeleteArgs>(args: SelectSubset<T, AgencyDeleteArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Agency.
     * @param {AgencyUpdateArgs} args - Arguments to update one Agency.
     * @example
     * // Update one Agency
     * const agency = await prisma.agency.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgencyUpdateArgs>(args: SelectSubset<T, AgencyUpdateArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Agencies.
     * @param {AgencyDeleteManyArgs} args - Arguments to filter Agencies to delete.
     * @example
     * // Delete a few Agencies
     * const { count } = await prisma.agency.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgencyDeleteManyArgs>(args?: SelectSubset<T, AgencyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Agencies
     * const agency = await prisma.agency.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgencyUpdateManyArgs>(args: SelectSubset<T, AgencyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agencies and returns the data updated in the database.
     * @param {AgencyUpdateManyAndReturnArgs} args - Arguments to update many Agencies.
     * @example
     * // Update many Agencies
     * const agency = await prisma.agency.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Agencies and only return the `id`
     * const agencyWithIdOnly = await prisma.agency.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AgencyUpdateManyAndReturnArgs>(args: SelectSubset<T, AgencyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Agency.
     * @param {AgencyUpsertArgs} args - Arguments to update or create a Agency.
     * @example
     * // Update or create a Agency
     * const agency = await prisma.agency.upsert({
     *   create: {
     *     // ... data to create a Agency
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Agency we want to update
     *   }
     * })
     */
    upsert<T extends AgencyUpsertArgs>(args: SelectSubset<T, AgencyUpsertArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Agencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyCountArgs} args - Arguments to filter Agencies to count.
     * @example
     * // Count the number of Agencies
     * const count = await prisma.agency.count({
     *   where: {
     *     // ... the filter for the Agencies we want to count
     *   }
     * })
    **/
    count<T extends AgencyCountArgs>(
      args?: Subset<T, AgencyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgencyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Agency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgencyAggregateArgs>(args: Subset<T, AgencyAggregateArgs>): Prisma.PrismaPromise<GetAgencyAggregateType<T>>

    /**
     * Group by Agency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgencyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgencyGroupByArgs['orderBy'] }
        : { orderBy?: AgencyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgencyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgencyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Agency model
   */
  readonly fields: AgencyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Agency.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgencyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Agency model
   */
  interface AgencyFieldRefs {
    readonly id: FieldRef<"Agency", 'String'>
    readonly name: FieldRef<"Agency", 'String'>
    readonly contact: FieldRef<"Agency", 'String'>
    readonly email: FieldRef<"Agency", 'String'>
    readonly userId: FieldRef<"Agency", 'String'>
    readonly createdAt: FieldRef<"Agency", 'DateTime'>
    readonly updatedAt: FieldRef<"Agency", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Agency findUnique
   */
  export type AgencyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agency to fetch.
     */
    where: AgencyWhereUniqueInput
  }

  /**
   * Agency findUniqueOrThrow
   */
  export type AgencyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agency to fetch.
     */
    where: AgencyWhereUniqueInput
  }

  /**
   * Agency findFirst
   */
  export type AgencyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agency to fetch.
     */
    where?: AgencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencies to fetch.
     */
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agencies.
     */
    cursor?: AgencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agencies.
     */
    distinct?: AgencyScalarFieldEnum | AgencyScalarFieldEnum[]
  }

  /**
   * Agency findFirstOrThrow
   */
  export type AgencyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agency to fetch.
     */
    where?: AgencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencies to fetch.
     */
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agencies.
     */
    cursor?: AgencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agencies.
     */
    distinct?: AgencyScalarFieldEnum | AgencyScalarFieldEnum[]
  }

  /**
   * Agency findMany
   */
  export type AgencyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agencies to fetch.
     */
    where?: AgencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencies to fetch.
     */
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Agencies.
     */
    cursor?: AgencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencies.
     */
    skip?: number
    distinct?: AgencyScalarFieldEnum | AgencyScalarFieldEnum[]
  }

  /**
   * Agency create
   */
  export type AgencyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * The data needed to create a Agency.
     */
    data: XOR<AgencyCreateInput, AgencyUncheckedCreateInput>
  }

  /**
   * Agency createMany
   */
  export type AgencyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Agencies.
     */
    data: AgencyCreateManyInput | AgencyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Agency createManyAndReturn
   */
  export type AgencyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * The data used to create many Agencies.
     */
    data: AgencyCreateManyInput | AgencyCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Agency update
   */
  export type AgencyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * The data needed to update a Agency.
     */
    data: XOR<AgencyUpdateInput, AgencyUncheckedUpdateInput>
    /**
     * Choose, which Agency to update.
     */
    where: AgencyWhereUniqueInput
  }

  /**
   * Agency updateMany
   */
  export type AgencyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Agencies.
     */
    data: XOR<AgencyUpdateManyMutationInput, AgencyUncheckedUpdateManyInput>
    /**
     * Filter which Agencies to update
     */
    where?: AgencyWhereInput
    /**
     * Limit how many Agencies to update.
     */
    limit?: number
  }

  /**
   * Agency updateManyAndReturn
   */
  export type AgencyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * The data used to update Agencies.
     */
    data: XOR<AgencyUpdateManyMutationInput, AgencyUncheckedUpdateManyInput>
    /**
     * Filter which Agencies to update
     */
    where?: AgencyWhereInput
    /**
     * Limit how many Agencies to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Agency upsert
   */
  export type AgencyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * The filter to search for the Agency to update in case it exists.
     */
    where: AgencyWhereUniqueInput
    /**
     * In case the Agency found by the `where` argument doesn't exist, create a new Agency with this data.
     */
    create: XOR<AgencyCreateInput, AgencyUncheckedCreateInput>
    /**
     * In case the Agency was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgencyUpdateInput, AgencyUncheckedUpdateInput>
  }

  /**
   * Agency delete
   */
  export type AgencyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter which Agency to delete.
     */
    where: AgencyWhereUniqueInput
  }

  /**
   * Agency deleteMany
   */
  export type AgencyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agencies to delete
     */
    where?: AgencyWhereInput
    /**
     * Limit how many Agencies to delete.
     */
    limit?: number
  }

  /**
   * Agency without action
   */
  export type AgencyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    role: $Enums.UserRole | null
    name: string | null
    company: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    role: $Enums.UserRole | null
    name: string | null
    company: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    role: number
    name: number
    company: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    role?: true
    name?: true
    company?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    role?: true
    name?: true
    company?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    role?: true
    name?: true
    company?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    password: string
    role: $Enums.UserRole
    name: string | null
    company: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    name?: boolean
    company?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    permissions?: boolean | User$permissionsArgs<ExtArgs>
    labourRequests?: boolean | User$labourRequestsArgs<ExtArgs>
    agencies?: boolean | User$agenciesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    name?: boolean
    company?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    name?: boolean
    company?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    name?: boolean
    company?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "role" | "name" | "company" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    permissions?: boolean | User$permissionsArgs<ExtArgs>
    labourRequests?: boolean | User$labourRequestsArgs<ExtArgs>
    agencies?: boolean | User$agenciesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      permissions: Prisma.$RolePermissionPayload<ExtArgs>[]
      labourRequests: Prisma.$LabourRequestPayload<ExtArgs>[]
      agencies: Prisma.$AgencyPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string
      role: $Enums.UserRole
      name: string | null
      company: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    permissions<T extends User$permissionsArgs<ExtArgs> = {}>(args?: Subset<T, User$permissionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    labourRequests<T extends User$labourRequestsArgs<ExtArgs> = {}>(args?: Subset<T, User$labourRequestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    agencies<T extends User$agenciesArgs<ExtArgs> = {}>(args?: Subset<T, User$agenciesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly name: FieldRef<"User", 'String'>
    readonly company: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.permissions
   */
  export type User$permissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    where?: RolePermissionWhereInput
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    cursor?: RolePermissionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * User.labourRequests
   */
  export type User$labourRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabourRequest
     */
    select?: LabourRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabourRequest
     */
    omit?: LabourRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabourRequestInclude<ExtArgs> | null
    where?: LabourRequestWhereInput
    orderBy?: LabourRequestOrderByWithRelationInput | LabourRequestOrderByWithRelationInput[]
    cursor?: LabourRequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LabourRequestScalarFieldEnum | LabourRequestScalarFieldEnum[]
  }

  /**
   * User.agencies
   */
  export type User$agenciesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    where?: AgencyWhereInput
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    cursor?: AgencyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgencyScalarFieldEnum | AgencyScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Candidate
   */

  export type AggregateCandidate = {
    _count: CandidateCountAggregateOutputType | null
    _min: CandidateMinAggregateOutputType | null
    _max: CandidateMaxAggregateOutputType | null
  }

  export type CandidateMinAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    cvUrl: string | null
    status: string | null
    labourRequestId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    cvUrl: string | null
    status: string | null
    labourRequestId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateCountAggregateOutputType = {
    id: number
    name: number
    code: number
    cvUrl: number
    status: number
    labourRequestId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CandidateMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    cvUrl?: true
    status?: true
    labourRequestId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    cvUrl?: true
    status?: true
    labourRequestId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    cvUrl?: true
    status?: true
    labourRequestId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CandidateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Candidate to aggregate.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Candidates
    **/
    _count?: true | CandidateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CandidateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CandidateMaxAggregateInputType
  }

  export type GetCandidateAggregateType<T extends CandidateAggregateArgs> = {
        [P in keyof T & keyof AggregateCandidate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCandidate[P]>
      : GetScalarType<T[P], AggregateCandidate[P]>
  }




  export type CandidateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CandidateWhereInput
    orderBy?: CandidateOrderByWithAggregationInput | CandidateOrderByWithAggregationInput[]
    by: CandidateScalarFieldEnum[] | CandidateScalarFieldEnum
    having?: CandidateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CandidateCountAggregateInputType | true
    _min?: CandidateMinAggregateInputType
    _max?: CandidateMaxAggregateInputType
  }

  export type CandidateGroupByOutputType = {
    id: string
    name: string
    code: string
    cvUrl: string | null
    status: string
    labourRequestId: string
    createdAt: Date
    updatedAt: Date
    _count: CandidateCountAggregateOutputType | null
    _min: CandidateMinAggregateOutputType | null
    _max: CandidateMaxAggregateOutputType | null
  }

  type GetCandidateGroupByPayload<T extends CandidateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CandidateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CandidateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CandidateGroupByOutputType[P]>
            : GetScalarType<T[P], CandidateGroupByOutputType[P]>
        }
      >
    >


  export type CandidateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    cvUrl?: boolean
    status?: boolean
    labourRequestId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidate"]>

  export type CandidateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    cvUrl?: boolean
    status?: boolean
    labourRequestId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidate"]>

  export type CandidateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    cvUrl?: boolean
    status?: boolean
    labourRequestId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidate"]>

  export type CandidateSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    cvUrl?: boolean
    status?: boolean
    labourRequestId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CandidateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "code" | "cvUrl" | "status" | "labourRequestId" | "createdAt" | "updatedAt", ExtArgs["result"]["candidate"]>
  export type CandidateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }
  export type CandidateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }
  export type CandidateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }

  export type $CandidatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Candidate"
    objects: {
      labourRequest: Prisma.$LabourRequestPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string
      cvUrl: string | null
      status: string
      labourRequestId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["candidate"]>
    composites: {}
  }

  type CandidateGetPayload<S extends boolean | null | undefined | CandidateDefaultArgs> = $Result.GetResult<Prisma.$CandidatePayload, S>

  type CandidateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CandidateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CandidateCountAggregateInputType | true
    }

  export interface CandidateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Candidate'], meta: { name: 'Candidate' } }
    /**
     * Find zero or one Candidate that matches the filter.
     * @param {CandidateFindUniqueArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CandidateFindUniqueArgs>(args: SelectSubset<T, CandidateFindUniqueArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Candidate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CandidateFindUniqueOrThrowArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CandidateFindUniqueOrThrowArgs>(args: SelectSubset<T, CandidateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Candidate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateFindFirstArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CandidateFindFirstArgs>(args?: SelectSubset<T, CandidateFindFirstArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Candidate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateFindFirstOrThrowArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CandidateFindFirstOrThrowArgs>(args?: SelectSubset<T, CandidateFindFirstOrThrowArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Candidates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Candidates
     * const candidates = await prisma.candidate.findMany()
     * 
     * // Get first 10 Candidates
     * const candidates = await prisma.candidate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const candidateWithIdOnly = await prisma.candidate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CandidateFindManyArgs>(args?: SelectSubset<T, CandidateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Candidate.
     * @param {CandidateCreateArgs} args - Arguments to create a Candidate.
     * @example
     * // Create one Candidate
     * const Candidate = await prisma.candidate.create({
     *   data: {
     *     // ... data to create a Candidate
     *   }
     * })
     * 
     */
    create<T extends CandidateCreateArgs>(args: SelectSubset<T, CandidateCreateArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Candidates.
     * @param {CandidateCreateManyArgs} args - Arguments to create many Candidates.
     * @example
     * // Create many Candidates
     * const candidate = await prisma.candidate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CandidateCreateManyArgs>(args?: SelectSubset<T, CandidateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Candidates and returns the data saved in the database.
     * @param {CandidateCreateManyAndReturnArgs} args - Arguments to create many Candidates.
     * @example
     * // Create many Candidates
     * const candidate = await prisma.candidate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Candidates and only return the `id`
     * const candidateWithIdOnly = await prisma.candidate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CandidateCreateManyAndReturnArgs>(args?: SelectSubset<T, CandidateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Candidate.
     * @param {CandidateDeleteArgs} args - Arguments to delete one Candidate.
     * @example
     * // Delete one Candidate
     * const Candidate = await prisma.candidate.delete({
     *   where: {
     *     // ... filter to delete one Candidate
     *   }
     * })
     * 
     */
    delete<T extends CandidateDeleteArgs>(args: SelectSubset<T, CandidateDeleteArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Candidate.
     * @param {CandidateUpdateArgs} args - Arguments to update one Candidate.
     * @example
     * // Update one Candidate
     * const candidate = await prisma.candidate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CandidateUpdateArgs>(args: SelectSubset<T, CandidateUpdateArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Candidates.
     * @param {CandidateDeleteManyArgs} args - Arguments to filter Candidates to delete.
     * @example
     * // Delete a few Candidates
     * const { count } = await prisma.candidate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CandidateDeleteManyArgs>(args?: SelectSubset<T, CandidateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Candidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Candidates
     * const candidate = await prisma.candidate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CandidateUpdateManyArgs>(args: SelectSubset<T, CandidateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Candidates and returns the data updated in the database.
     * @param {CandidateUpdateManyAndReturnArgs} args - Arguments to update many Candidates.
     * @example
     * // Update many Candidates
     * const candidate = await prisma.candidate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Candidates and only return the `id`
     * const candidateWithIdOnly = await prisma.candidate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CandidateUpdateManyAndReturnArgs>(args: SelectSubset<T, CandidateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Candidate.
     * @param {CandidateUpsertArgs} args - Arguments to update or create a Candidate.
     * @example
     * // Update or create a Candidate
     * const candidate = await prisma.candidate.upsert({
     *   create: {
     *     // ... data to create a Candidate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Candidate we want to update
     *   }
     * })
     */
    upsert<T extends CandidateUpsertArgs>(args: SelectSubset<T, CandidateUpsertArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Candidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateCountArgs} args - Arguments to filter Candidates to count.
     * @example
     * // Count the number of Candidates
     * const count = await prisma.candidate.count({
     *   where: {
     *     // ... the filter for the Candidates we want to count
     *   }
     * })
    **/
    count<T extends CandidateCountArgs>(
      args?: Subset<T, CandidateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CandidateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Candidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CandidateAggregateArgs>(args: Subset<T, CandidateAggregateArgs>): Prisma.PrismaPromise<GetCandidateAggregateType<T>>

    /**
     * Group by Candidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CandidateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CandidateGroupByArgs['orderBy'] }
        : { orderBy?: CandidateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CandidateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCandidateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Candidate model
   */
  readonly fields: CandidateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Candidate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CandidateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    labourRequest<T extends LabourRequestDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LabourRequestDefaultArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Candidate model
   */
  interface CandidateFieldRefs {
    readonly id: FieldRef<"Candidate", 'String'>
    readonly name: FieldRef<"Candidate", 'String'>
    readonly code: FieldRef<"Candidate", 'String'>
    readonly cvUrl: FieldRef<"Candidate", 'String'>
    readonly status: FieldRef<"Candidate", 'String'>
    readonly labourRequestId: FieldRef<"Candidate", 'String'>
    readonly createdAt: FieldRef<"Candidate", 'DateTime'>
    readonly updatedAt: FieldRef<"Candidate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Candidate findUnique
   */
  export type CandidateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate findUniqueOrThrow
   */
  export type CandidateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate findFirst
   */
  export type CandidateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Candidates.
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Candidates.
     */
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Candidate findFirstOrThrow
   */
  export type CandidateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Candidates.
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Candidates.
     */
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Candidate findMany
   */
  export type CandidateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidates to fetch.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Candidates.
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Candidate create
   */
  export type CandidateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * The data needed to create a Candidate.
     */
    data: XOR<CandidateCreateInput, CandidateUncheckedCreateInput>
  }

  /**
   * Candidate createMany
   */
  export type CandidateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Candidates.
     */
    data: CandidateCreateManyInput | CandidateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Candidate createManyAndReturn
   */
  export type CandidateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * The data used to create many Candidates.
     */
    data: CandidateCreateManyInput | CandidateCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Candidate update
   */
  export type CandidateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * The data needed to update a Candidate.
     */
    data: XOR<CandidateUpdateInput, CandidateUncheckedUpdateInput>
    /**
     * Choose, which Candidate to update.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate updateMany
   */
  export type CandidateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Candidates.
     */
    data: XOR<CandidateUpdateManyMutationInput, CandidateUncheckedUpdateManyInput>
    /**
     * Filter which Candidates to update
     */
    where?: CandidateWhereInput
    /**
     * Limit how many Candidates to update.
     */
    limit?: number
  }

  /**
   * Candidate updateManyAndReturn
   */
  export type CandidateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * The data used to update Candidates.
     */
    data: XOR<CandidateUpdateManyMutationInput, CandidateUncheckedUpdateManyInput>
    /**
     * Filter which Candidates to update
     */
    where?: CandidateWhereInput
    /**
     * Limit how many Candidates to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Candidate upsert
   */
  export type CandidateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * The filter to search for the Candidate to update in case it exists.
     */
    where: CandidateWhereUniqueInput
    /**
     * In case the Candidate found by the `where` argument doesn't exist, create a new Candidate with this data.
     */
    create: XOR<CandidateCreateInput, CandidateUncheckedCreateInput>
    /**
     * In case the Candidate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CandidateUpdateInput, CandidateUncheckedUpdateInput>
  }

  /**
   * Candidate delete
   */
  export type CandidateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter which Candidate to delete.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate deleteMany
   */
  export type CandidateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Candidates to delete
     */
    where?: CandidateWhereInput
    /**
     * Limit how many Candidates to delete.
     */
    limit?: number
  }

  /**
   * Candidate without action
   */
  export type CandidateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
  }


  /**
   * Model Procedure
   */

  export type AggregateProcedure = {
    _count: ProcedureCountAggregateOutputType | null
    _min: ProcedureMinAggregateOutputType | null
    _max: ProcedureMaxAggregateOutputType | null
  }

  export type ProcedureMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    status: string | null
    dueDate: Date | null
    completedDate: Date | null
    labourRequestId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProcedureMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    status: string | null
    dueDate: Date | null
    completedDate: Date | null
    labourRequestId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProcedureCountAggregateOutputType = {
    id: number
    name: number
    description: number
    status: number
    dueDate: number
    completedDate: number
    labourRequestId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProcedureMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    status?: true
    dueDate?: true
    completedDate?: true
    labourRequestId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProcedureMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    status?: true
    dueDate?: true
    completedDate?: true
    labourRequestId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProcedureCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    status?: true
    dueDate?: true
    completedDate?: true
    labourRequestId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProcedureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Procedure to aggregate.
     */
    where?: ProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Procedures to fetch.
     */
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Procedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Procedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Procedures
    **/
    _count?: true | ProcedureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcedureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcedureMaxAggregateInputType
  }

  export type GetProcedureAggregateType<T extends ProcedureAggregateArgs> = {
        [P in keyof T & keyof AggregateProcedure]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcedure[P]>
      : GetScalarType<T[P], AggregateProcedure[P]>
  }




  export type ProcedureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcedureWhereInput
    orderBy?: ProcedureOrderByWithAggregationInput | ProcedureOrderByWithAggregationInput[]
    by: ProcedureScalarFieldEnum[] | ProcedureScalarFieldEnum
    having?: ProcedureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcedureCountAggregateInputType | true
    _min?: ProcedureMinAggregateInputType
    _max?: ProcedureMaxAggregateInputType
  }

  export type ProcedureGroupByOutputType = {
    id: string
    name: string
    description: string | null
    status: string
    dueDate: Date | null
    completedDate: Date | null
    labourRequestId: string
    createdAt: Date
    updatedAt: Date
    _count: ProcedureCountAggregateOutputType | null
    _min: ProcedureMinAggregateOutputType | null
    _max: ProcedureMaxAggregateOutputType | null
  }

  type GetProcedureGroupByPayload<T extends ProcedureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcedureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcedureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcedureGroupByOutputType[P]>
            : GetScalarType<T[P], ProcedureGroupByOutputType[P]>
        }
      >
    >


  export type ProcedureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    dueDate?: boolean
    completedDate?: boolean
    labourRequestId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["procedure"]>

  export type ProcedureSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    dueDate?: boolean
    completedDate?: boolean
    labourRequestId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["procedure"]>

  export type ProcedureSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    dueDate?: boolean
    completedDate?: boolean
    labourRequestId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["procedure"]>

  export type ProcedureSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    dueDate?: boolean
    completedDate?: boolean
    labourRequestId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProcedureOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "status" | "dueDate" | "completedDate" | "labourRequestId" | "createdAt" | "updatedAt", ExtArgs["result"]["procedure"]>
  export type ProcedureInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }
  export type ProcedureIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }
  export type ProcedureIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    labourRequest?: boolean | LabourRequestDefaultArgs<ExtArgs>
  }

  export type $ProcedurePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Procedure"
    objects: {
      labourRequest: Prisma.$LabourRequestPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      status: string
      dueDate: Date | null
      completedDate: Date | null
      labourRequestId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["procedure"]>
    composites: {}
  }

  type ProcedureGetPayload<S extends boolean | null | undefined | ProcedureDefaultArgs> = $Result.GetResult<Prisma.$ProcedurePayload, S>

  type ProcedureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProcedureFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProcedureCountAggregateInputType | true
    }

  export interface ProcedureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Procedure'], meta: { name: 'Procedure' } }
    /**
     * Find zero or one Procedure that matches the filter.
     * @param {ProcedureFindUniqueArgs} args - Arguments to find a Procedure
     * @example
     * // Get one Procedure
     * const procedure = await prisma.procedure.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcedureFindUniqueArgs>(args: SelectSubset<T, ProcedureFindUniqueArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Procedure that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProcedureFindUniqueOrThrowArgs} args - Arguments to find a Procedure
     * @example
     * // Get one Procedure
     * const procedure = await prisma.procedure.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcedureFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcedureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Procedure that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureFindFirstArgs} args - Arguments to find a Procedure
     * @example
     * // Get one Procedure
     * const procedure = await prisma.procedure.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcedureFindFirstArgs>(args?: SelectSubset<T, ProcedureFindFirstArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Procedure that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureFindFirstOrThrowArgs} args - Arguments to find a Procedure
     * @example
     * // Get one Procedure
     * const procedure = await prisma.procedure.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcedureFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcedureFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Procedures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Procedures
     * const procedures = await prisma.procedure.findMany()
     * 
     * // Get first 10 Procedures
     * const procedures = await prisma.procedure.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const procedureWithIdOnly = await prisma.procedure.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcedureFindManyArgs>(args?: SelectSubset<T, ProcedureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Procedure.
     * @param {ProcedureCreateArgs} args - Arguments to create a Procedure.
     * @example
     * // Create one Procedure
     * const Procedure = await prisma.procedure.create({
     *   data: {
     *     // ... data to create a Procedure
     *   }
     * })
     * 
     */
    create<T extends ProcedureCreateArgs>(args: SelectSubset<T, ProcedureCreateArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Procedures.
     * @param {ProcedureCreateManyArgs} args - Arguments to create many Procedures.
     * @example
     * // Create many Procedures
     * const procedure = await prisma.procedure.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcedureCreateManyArgs>(args?: SelectSubset<T, ProcedureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Procedures and returns the data saved in the database.
     * @param {ProcedureCreateManyAndReturnArgs} args - Arguments to create many Procedures.
     * @example
     * // Create many Procedures
     * const procedure = await prisma.procedure.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Procedures and only return the `id`
     * const procedureWithIdOnly = await prisma.procedure.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcedureCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcedureCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Procedure.
     * @param {ProcedureDeleteArgs} args - Arguments to delete one Procedure.
     * @example
     * // Delete one Procedure
     * const Procedure = await prisma.procedure.delete({
     *   where: {
     *     // ... filter to delete one Procedure
     *   }
     * })
     * 
     */
    delete<T extends ProcedureDeleteArgs>(args: SelectSubset<T, ProcedureDeleteArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Procedure.
     * @param {ProcedureUpdateArgs} args - Arguments to update one Procedure.
     * @example
     * // Update one Procedure
     * const procedure = await prisma.procedure.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcedureUpdateArgs>(args: SelectSubset<T, ProcedureUpdateArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Procedures.
     * @param {ProcedureDeleteManyArgs} args - Arguments to filter Procedures to delete.
     * @example
     * // Delete a few Procedures
     * const { count } = await prisma.procedure.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcedureDeleteManyArgs>(args?: SelectSubset<T, ProcedureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Procedures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Procedures
     * const procedure = await prisma.procedure.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcedureUpdateManyArgs>(args: SelectSubset<T, ProcedureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Procedures and returns the data updated in the database.
     * @param {ProcedureUpdateManyAndReturnArgs} args - Arguments to update many Procedures.
     * @example
     * // Update many Procedures
     * const procedure = await prisma.procedure.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Procedures and only return the `id`
     * const procedureWithIdOnly = await prisma.procedure.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProcedureUpdateManyAndReturnArgs>(args: SelectSubset<T, ProcedureUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Procedure.
     * @param {ProcedureUpsertArgs} args - Arguments to update or create a Procedure.
     * @example
     * // Update or create a Procedure
     * const procedure = await prisma.procedure.upsert({
     *   create: {
     *     // ... data to create a Procedure
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Procedure we want to update
     *   }
     * })
     */
    upsert<T extends ProcedureUpsertArgs>(args: SelectSubset<T, ProcedureUpsertArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Procedures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureCountArgs} args - Arguments to filter Procedures to count.
     * @example
     * // Count the number of Procedures
     * const count = await prisma.procedure.count({
     *   where: {
     *     // ... the filter for the Procedures we want to count
     *   }
     * })
    **/
    count<T extends ProcedureCountArgs>(
      args?: Subset<T, ProcedureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcedureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Procedure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProcedureAggregateArgs>(args: Subset<T, ProcedureAggregateArgs>): Prisma.PrismaPromise<GetProcedureAggregateType<T>>

    /**
     * Group by Procedure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProcedureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcedureGroupByArgs['orderBy'] }
        : { orderBy?: ProcedureGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProcedureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcedureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Procedure model
   */
  readonly fields: ProcedureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Procedure.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcedureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    labourRequest<T extends LabourRequestDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LabourRequestDefaultArgs<ExtArgs>>): Prisma__LabourRequestClient<$Result.GetResult<Prisma.$LabourRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Procedure model
   */
  interface ProcedureFieldRefs {
    readonly id: FieldRef<"Procedure", 'String'>
    readonly name: FieldRef<"Procedure", 'String'>
    readonly description: FieldRef<"Procedure", 'String'>
    readonly status: FieldRef<"Procedure", 'String'>
    readonly dueDate: FieldRef<"Procedure", 'DateTime'>
    readonly completedDate: FieldRef<"Procedure", 'DateTime'>
    readonly labourRequestId: FieldRef<"Procedure", 'String'>
    readonly createdAt: FieldRef<"Procedure", 'DateTime'>
    readonly updatedAt: FieldRef<"Procedure", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Procedure findUnique
   */
  export type ProcedureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedure to fetch.
     */
    where: ProcedureWhereUniqueInput
  }

  /**
   * Procedure findUniqueOrThrow
   */
  export type ProcedureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedure to fetch.
     */
    where: ProcedureWhereUniqueInput
  }

  /**
   * Procedure findFirst
   */
  export type ProcedureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedure to fetch.
     */
    where?: ProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Procedures to fetch.
     */
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Procedures.
     */
    cursor?: ProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Procedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Procedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Procedures.
     */
    distinct?: ProcedureScalarFieldEnum | ProcedureScalarFieldEnum[]
  }

  /**
   * Procedure findFirstOrThrow
   */
  export type ProcedureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedure to fetch.
     */
    where?: ProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Procedures to fetch.
     */
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Procedures.
     */
    cursor?: ProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Procedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Procedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Procedures.
     */
    distinct?: ProcedureScalarFieldEnum | ProcedureScalarFieldEnum[]
  }

  /**
   * Procedure findMany
   */
  export type ProcedureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedures to fetch.
     */
    where?: ProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Procedures to fetch.
     */
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Procedures.
     */
    cursor?: ProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Procedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Procedures.
     */
    skip?: number
    distinct?: ProcedureScalarFieldEnum | ProcedureScalarFieldEnum[]
  }

  /**
   * Procedure create
   */
  export type ProcedureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * The data needed to create a Procedure.
     */
    data: XOR<ProcedureCreateInput, ProcedureUncheckedCreateInput>
  }

  /**
   * Procedure createMany
   */
  export type ProcedureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Procedures.
     */
    data: ProcedureCreateManyInput | ProcedureCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Procedure createManyAndReturn
   */
  export type ProcedureCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * The data used to create many Procedures.
     */
    data: ProcedureCreateManyInput | ProcedureCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Procedure update
   */
  export type ProcedureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * The data needed to update a Procedure.
     */
    data: XOR<ProcedureUpdateInput, ProcedureUncheckedUpdateInput>
    /**
     * Choose, which Procedure to update.
     */
    where: ProcedureWhereUniqueInput
  }

  /**
   * Procedure updateMany
   */
  export type ProcedureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Procedures.
     */
    data: XOR<ProcedureUpdateManyMutationInput, ProcedureUncheckedUpdateManyInput>
    /**
     * Filter which Procedures to update
     */
    where?: ProcedureWhereInput
    /**
     * Limit how many Procedures to update.
     */
    limit?: number
  }

  /**
   * Procedure updateManyAndReturn
   */
  export type ProcedureUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * The data used to update Procedures.
     */
    data: XOR<ProcedureUpdateManyMutationInput, ProcedureUncheckedUpdateManyInput>
    /**
     * Filter which Procedures to update
     */
    where?: ProcedureWhereInput
    /**
     * Limit how many Procedures to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Procedure upsert
   */
  export type ProcedureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * The filter to search for the Procedure to update in case it exists.
     */
    where: ProcedureWhereUniqueInput
    /**
     * In case the Procedure found by the `where` argument doesn't exist, create a new Procedure with this data.
     */
    create: XOR<ProcedureCreateInput, ProcedureUncheckedCreateInput>
    /**
     * In case the Procedure was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcedureUpdateInput, ProcedureUncheckedUpdateInput>
  }

  /**
   * Procedure delete
   */
  export type ProcedureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter which Procedure to delete.
     */
    where: ProcedureWhereUniqueInput
  }

  /**
   * Procedure deleteMany
   */
  export type ProcedureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Procedures to delete
     */
    where?: ProcedureWhereInput
    /**
     * Limit how many Procedures to delete.
     */
    limit?: number
  }

  /**
   * Procedure without action
   */
  export type ProcedureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Procedure
     */
    omit?: ProcedureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const RolePermissionScalarFieldEnum: {
    id: 'id',
    role: 'role',
    permission: 'permission',
    createdAt: 'createdAt',
    userId: 'userId'
  };

  export type RolePermissionScalarFieldEnum = (typeof RolePermissionScalarFieldEnum)[keyof typeof RolePermissionScalarFieldEnum]


  export const LabourRequestScalarFieldEnum: {
    id: 'id',
    jobTitle: 'jobTitle',
    nationality: 'nationality',
    salary: 'salary',
    quantity: 'quantity',
    requirements: 'requirements',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type LabourRequestScalarFieldEnum = (typeof LabourRequestScalarFieldEnum)[keyof typeof LabourRequestScalarFieldEnum]


  export const AgencyScalarFieldEnum: {
    id: 'id',
    name: 'name',
    contact: 'contact',
    email: 'email',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AgencyScalarFieldEnum = (typeof AgencyScalarFieldEnum)[keyof typeof AgencyScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    role: 'role',
    name: 'name',
    company: 'company',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CandidateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    cvUrl: 'cvUrl',
    status: 'status',
    labourRequestId: 'labourRequestId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CandidateScalarFieldEnum = (typeof CandidateScalarFieldEnum)[keyof typeof CandidateScalarFieldEnum]


  export const ProcedureScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    status: 'status',
    dueDate: 'dueDate',
    completedDate: 'completedDate',
    labourRequestId: 'labourRequestId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProcedureScalarFieldEnum = (typeof ProcedureScalarFieldEnum)[keyof typeof ProcedureScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'Permission'
   */
  export type EnumPermissionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Permission'>
    


  /**
   * Reference to a field of type 'Permission[]'
   */
  export type ListEnumPermissionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Permission[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type RolePermissionWhereInput = {
    AND?: RolePermissionWhereInput | RolePermissionWhereInput[]
    OR?: RolePermissionWhereInput[]
    NOT?: RolePermissionWhereInput | RolePermissionWhereInput[]
    id?: StringFilter<"RolePermission"> | string
    role?: EnumUserRoleFilter<"RolePermission"> | $Enums.UserRole
    permission?: EnumPermissionFilter<"RolePermission"> | $Enums.Permission
    createdAt?: DateTimeFilter<"RolePermission"> | Date | string
    userId?: StringNullableFilter<"RolePermission"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type RolePermissionOrderByWithRelationInput = {
    id?: SortOrder
    role?: SortOrder
    permission?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type RolePermissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    role_permission?: RolePermissionRolePermissionCompoundUniqueInput
    AND?: RolePermissionWhereInput | RolePermissionWhereInput[]
    OR?: RolePermissionWhereInput[]
    NOT?: RolePermissionWhereInput | RolePermissionWhereInput[]
    role?: EnumUserRoleFilter<"RolePermission"> | $Enums.UserRole
    permission?: EnumPermissionFilter<"RolePermission"> | $Enums.Permission
    createdAt?: DateTimeFilter<"RolePermission"> | Date | string
    userId?: StringNullableFilter<"RolePermission"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id" | "role_permission">

  export type RolePermissionOrderByWithAggregationInput = {
    id?: SortOrder
    role?: SortOrder
    permission?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrderInput | SortOrder
    _count?: RolePermissionCountOrderByAggregateInput
    _max?: RolePermissionMaxOrderByAggregateInput
    _min?: RolePermissionMinOrderByAggregateInput
  }

  export type RolePermissionScalarWhereWithAggregatesInput = {
    AND?: RolePermissionScalarWhereWithAggregatesInput | RolePermissionScalarWhereWithAggregatesInput[]
    OR?: RolePermissionScalarWhereWithAggregatesInput[]
    NOT?: RolePermissionScalarWhereWithAggregatesInput | RolePermissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RolePermission"> | string
    role?: EnumUserRoleWithAggregatesFilter<"RolePermission"> | $Enums.UserRole
    permission?: EnumPermissionWithAggregatesFilter<"RolePermission"> | $Enums.Permission
    createdAt?: DateTimeWithAggregatesFilter<"RolePermission"> | Date | string
    userId?: StringNullableWithAggregatesFilter<"RolePermission"> | string | null
  }

  export type LabourRequestWhereInput = {
    AND?: LabourRequestWhereInput | LabourRequestWhereInput[]
    OR?: LabourRequestWhereInput[]
    NOT?: LabourRequestWhereInput | LabourRequestWhereInput[]
    id?: StringFilter<"LabourRequest"> | string
    jobTitle?: StringFilter<"LabourRequest"> | string
    nationality?: StringFilter<"LabourRequest"> | string
    salary?: FloatFilter<"LabourRequest"> | number
    quantity?: IntFilter<"LabourRequest"> | number
    requirements?: StringFilter<"LabourRequest"> | string
    status?: StringFilter<"LabourRequest"> | string
    createdAt?: DateTimeFilter<"LabourRequest"> | Date | string
    updatedAt?: DateTimeFilter<"LabourRequest"> | Date | string
    userId?: StringFilter<"LabourRequest"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    candidates?: CandidateListRelationFilter
    procedures?: ProcedureListRelationFilter
  }

  export type LabourRequestOrderByWithRelationInput = {
    id?: SortOrder
    jobTitle?: SortOrder
    nationality?: SortOrder
    salary?: SortOrder
    quantity?: SortOrder
    requirements?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    candidates?: CandidateOrderByRelationAggregateInput
    procedures?: ProcedureOrderByRelationAggregateInput
  }

  export type LabourRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LabourRequestWhereInput | LabourRequestWhereInput[]
    OR?: LabourRequestWhereInput[]
    NOT?: LabourRequestWhereInput | LabourRequestWhereInput[]
    jobTitle?: StringFilter<"LabourRequest"> | string
    nationality?: StringFilter<"LabourRequest"> | string
    salary?: FloatFilter<"LabourRequest"> | number
    quantity?: IntFilter<"LabourRequest"> | number
    requirements?: StringFilter<"LabourRequest"> | string
    status?: StringFilter<"LabourRequest"> | string
    createdAt?: DateTimeFilter<"LabourRequest"> | Date | string
    updatedAt?: DateTimeFilter<"LabourRequest"> | Date | string
    userId?: StringFilter<"LabourRequest"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    candidates?: CandidateListRelationFilter
    procedures?: ProcedureListRelationFilter
  }, "id">

  export type LabourRequestOrderByWithAggregationInput = {
    id?: SortOrder
    jobTitle?: SortOrder
    nationality?: SortOrder
    salary?: SortOrder
    quantity?: SortOrder
    requirements?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: LabourRequestCountOrderByAggregateInput
    _avg?: LabourRequestAvgOrderByAggregateInput
    _max?: LabourRequestMaxOrderByAggregateInput
    _min?: LabourRequestMinOrderByAggregateInput
    _sum?: LabourRequestSumOrderByAggregateInput
  }

  export type LabourRequestScalarWhereWithAggregatesInput = {
    AND?: LabourRequestScalarWhereWithAggregatesInput | LabourRequestScalarWhereWithAggregatesInput[]
    OR?: LabourRequestScalarWhereWithAggregatesInput[]
    NOT?: LabourRequestScalarWhereWithAggregatesInput | LabourRequestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LabourRequest"> | string
    jobTitle?: StringWithAggregatesFilter<"LabourRequest"> | string
    nationality?: StringWithAggregatesFilter<"LabourRequest"> | string
    salary?: FloatWithAggregatesFilter<"LabourRequest"> | number
    quantity?: IntWithAggregatesFilter<"LabourRequest"> | number
    requirements?: StringWithAggregatesFilter<"LabourRequest"> | string
    status?: StringWithAggregatesFilter<"LabourRequest"> | string
    createdAt?: DateTimeWithAggregatesFilter<"LabourRequest"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LabourRequest"> | Date | string
    userId?: StringWithAggregatesFilter<"LabourRequest"> | string
  }

  export type AgencyWhereInput = {
    AND?: AgencyWhereInput | AgencyWhereInput[]
    OR?: AgencyWhereInput[]
    NOT?: AgencyWhereInput | AgencyWhereInput[]
    id?: StringFilter<"Agency"> | string
    name?: StringFilter<"Agency"> | string
    contact?: StringFilter<"Agency"> | string
    email?: StringFilter<"Agency"> | string
    userId?: StringFilter<"Agency"> | string
    createdAt?: DateTimeFilter<"Agency"> | Date | string
    updatedAt?: DateTimeFilter<"Agency"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AgencyOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    email?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AgencyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: AgencyWhereInput | AgencyWhereInput[]
    OR?: AgencyWhereInput[]
    NOT?: AgencyWhereInput | AgencyWhereInput[]
    name?: StringFilter<"Agency"> | string
    contact?: StringFilter<"Agency"> | string
    userId?: StringFilter<"Agency"> | string
    createdAt?: DateTimeFilter<"Agency"> | Date | string
    updatedAt?: DateTimeFilter<"Agency"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "email">

  export type AgencyOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    email?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AgencyCountOrderByAggregateInput
    _max?: AgencyMaxOrderByAggregateInput
    _min?: AgencyMinOrderByAggregateInput
  }

  export type AgencyScalarWhereWithAggregatesInput = {
    AND?: AgencyScalarWhereWithAggregatesInput | AgencyScalarWhereWithAggregatesInput[]
    OR?: AgencyScalarWhereWithAggregatesInput[]
    NOT?: AgencyScalarWhereWithAggregatesInput | AgencyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Agency"> | string
    name?: StringWithAggregatesFilter<"Agency"> | string
    contact?: StringWithAggregatesFilter<"Agency"> | string
    email?: StringWithAggregatesFilter<"Agency"> | string
    userId?: StringWithAggregatesFilter<"Agency"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Agency"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Agency"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    name?: StringNullableFilter<"User"> | string | null
    company?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    permissions?: RolePermissionListRelationFilter
    labourRequests?: LabourRequestListRelationFilter
    agencies?: AgencyListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    name?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    permissions?: RolePermissionOrderByRelationAggregateInput
    labourRequests?: LabourRequestOrderByRelationAggregateInput
    agencies?: AgencyOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    name?: StringNullableFilter<"User"> | string | null
    company?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    permissions?: RolePermissionListRelationFilter
    labourRequests?: LabourRequestListRelationFilter
    agencies?: AgencyListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    name?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    company?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type CandidateWhereInput = {
    AND?: CandidateWhereInput | CandidateWhereInput[]
    OR?: CandidateWhereInput[]
    NOT?: CandidateWhereInput | CandidateWhereInput[]
    id?: StringFilter<"Candidate"> | string
    name?: StringFilter<"Candidate"> | string
    code?: StringFilter<"Candidate"> | string
    cvUrl?: StringNullableFilter<"Candidate"> | string | null
    status?: StringFilter<"Candidate"> | string
    labourRequestId?: StringFilter<"Candidate"> | string
    createdAt?: DateTimeFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeFilter<"Candidate"> | Date | string
    labourRequest?: XOR<LabourRequestScalarRelationFilter, LabourRequestWhereInput>
  }

  export type CandidateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    cvUrl?: SortOrderInput | SortOrder
    status?: SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    labourRequest?: LabourRequestOrderByWithRelationInput
  }

  export type CandidateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: CandidateWhereInput | CandidateWhereInput[]
    OR?: CandidateWhereInput[]
    NOT?: CandidateWhereInput | CandidateWhereInput[]
    name?: StringFilter<"Candidate"> | string
    cvUrl?: StringNullableFilter<"Candidate"> | string | null
    status?: StringFilter<"Candidate"> | string
    labourRequestId?: StringFilter<"Candidate"> | string
    createdAt?: DateTimeFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeFilter<"Candidate"> | Date | string
    labourRequest?: XOR<LabourRequestScalarRelationFilter, LabourRequestWhereInput>
  }, "id" | "code">

  export type CandidateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    cvUrl?: SortOrderInput | SortOrder
    status?: SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CandidateCountOrderByAggregateInput
    _max?: CandidateMaxOrderByAggregateInput
    _min?: CandidateMinOrderByAggregateInput
  }

  export type CandidateScalarWhereWithAggregatesInput = {
    AND?: CandidateScalarWhereWithAggregatesInput | CandidateScalarWhereWithAggregatesInput[]
    OR?: CandidateScalarWhereWithAggregatesInput[]
    NOT?: CandidateScalarWhereWithAggregatesInput | CandidateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Candidate"> | string
    name?: StringWithAggregatesFilter<"Candidate"> | string
    code?: StringWithAggregatesFilter<"Candidate"> | string
    cvUrl?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    status?: StringWithAggregatesFilter<"Candidate"> | string
    labourRequestId?: StringWithAggregatesFilter<"Candidate"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Candidate"> | Date | string
  }

  export type ProcedureWhereInput = {
    AND?: ProcedureWhereInput | ProcedureWhereInput[]
    OR?: ProcedureWhereInput[]
    NOT?: ProcedureWhereInput | ProcedureWhereInput[]
    id?: StringFilter<"Procedure"> | string
    name?: StringFilter<"Procedure"> | string
    description?: StringNullableFilter<"Procedure"> | string | null
    status?: StringFilter<"Procedure"> | string
    dueDate?: DateTimeNullableFilter<"Procedure"> | Date | string | null
    completedDate?: DateTimeNullableFilter<"Procedure"> | Date | string | null
    labourRequestId?: StringFilter<"Procedure"> | string
    createdAt?: DateTimeFilter<"Procedure"> | Date | string
    updatedAt?: DateTimeFilter<"Procedure"> | Date | string
    labourRequest?: XOR<LabourRequestScalarRelationFilter, LabourRequestWhereInput>
  }

  export type ProcedureOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    completedDate?: SortOrderInput | SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    labourRequest?: LabourRequestOrderByWithRelationInput
  }

  export type ProcedureWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcedureWhereInput | ProcedureWhereInput[]
    OR?: ProcedureWhereInput[]
    NOT?: ProcedureWhereInput | ProcedureWhereInput[]
    name?: StringFilter<"Procedure"> | string
    description?: StringNullableFilter<"Procedure"> | string | null
    status?: StringFilter<"Procedure"> | string
    dueDate?: DateTimeNullableFilter<"Procedure"> | Date | string | null
    completedDate?: DateTimeNullableFilter<"Procedure"> | Date | string | null
    labourRequestId?: StringFilter<"Procedure"> | string
    createdAt?: DateTimeFilter<"Procedure"> | Date | string
    updatedAt?: DateTimeFilter<"Procedure"> | Date | string
    labourRequest?: XOR<LabourRequestScalarRelationFilter, LabourRequestWhereInput>
  }, "id">

  export type ProcedureOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    completedDate?: SortOrderInput | SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProcedureCountOrderByAggregateInput
    _max?: ProcedureMaxOrderByAggregateInput
    _min?: ProcedureMinOrderByAggregateInput
  }

  export type ProcedureScalarWhereWithAggregatesInput = {
    AND?: ProcedureScalarWhereWithAggregatesInput | ProcedureScalarWhereWithAggregatesInput[]
    OR?: ProcedureScalarWhereWithAggregatesInput[]
    NOT?: ProcedureScalarWhereWithAggregatesInput | ProcedureScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Procedure"> | string
    name?: StringWithAggregatesFilter<"Procedure"> | string
    description?: StringNullableWithAggregatesFilter<"Procedure"> | string | null
    status?: StringWithAggregatesFilter<"Procedure"> | string
    dueDate?: DateTimeNullableWithAggregatesFilter<"Procedure"> | Date | string | null
    completedDate?: DateTimeNullableWithAggregatesFilter<"Procedure"> | Date | string | null
    labourRequestId?: StringWithAggregatesFilter<"Procedure"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Procedure"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Procedure"> | Date | string
  }

  export type RolePermissionCreateInput = {
    id?: string
    role: $Enums.UserRole
    permission: $Enums.Permission
    createdAt?: Date | string
    user?: UserCreateNestedOneWithoutPermissionsInput
  }

  export type RolePermissionUncheckedCreateInput = {
    id?: string
    role: $Enums.UserRole
    permission: $Enums.Permission
    createdAt?: Date | string
    userId?: string | null
  }

  export type RolePermissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutPermissionsNestedInput
  }

  export type RolePermissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RolePermissionCreateManyInput = {
    id?: string
    role: $Enums.UserRole
    permission: $Enums.Permission
    createdAt?: Date | string
    userId?: string | null
  }

  export type RolePermissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LabourRequestCreateInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutLabourRequestsInput
    candidates?: CandidateCreateNestedManyWithoutLabourRequestInput
    procedures?: ProcedureCreateNestedManyWithoutLabourRequestInput
  }

  export type LabourRequestUncheckedCreateInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    candidates?: CandidateUncheckedCreateNestedManyWithoutLabourRequestInput
    procedures?: ProcedureUncheckedCreateNestedManyWithoutLabourRequestInput
  }

  export type LabourRequestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLabourRequestsNestedInput
    candidates?: CandidateUpdateManyWithoutLabourRequestNestedInput
    procedures?: ProcedureUpdateManyWithoutLabourRequestNestedInput
  }

  export type LabourRequestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    candidates?: CandidateUncheckedUpdateManyWithoutLabourRequestNestedInput
    procedures?: ProcedureUncheckedUpdateManyWithoutLabourRequestNestedInput
  }

  export type LabourRequestCreateManyInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type LabourRequestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LabourRequestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type AgencyCreateInput = {
    id?: string
    name: string
    contact: string
    email: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutAgenciesInput
  }

  export type AgencyUncheckedCreateInput = {
    id?: string
    name: string
    contact: string
    email: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgencyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAgenciesNestedInput
  }

  export type AgencyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgencyCreateManyInput = {
    id?: string
    name: string
    contact: string
    email: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgencyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgencyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    password: string
    role: $Enums.UserRole
    name?: string | null
    company?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionCreateNestedManyWithoutUserInput
    labourRequests?: LabourRequestCreateNestedManyWithoutUserInput
    agencies?: AgencyCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    password: string
    role: $Enums.UserRole
    name?: string | null
    company?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionUncheckedCreateNestedManyWithoutUserInput
    labourRequests?: LabourRequestUncheckedCreateNestedManyWithoutUserInput
    agencies?: AgencyUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUpdateManyWithoutUserNestedInput
    labourRequests?: LabourRequestUpdateManyWithoutUserNestedInput
    agencies?: AgencyUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUncheckedUpdateManyWithoutUserNestedInput
    labourRequests?: LabourRequestUncheckedUpdateManyWithoutUserNestedInput
    agencies?: AgencyUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    password: string
    role: $Enums.UserRole
    name?: string | null
    company?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateCreateInput = {
    id?: string
    name: string
    code: string
    cvUrl?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    labourRequest: LabourRequestCreateNestedOneWithoutCandidatesInput
  }

  export type CandidateUncheckedCreateInput = {
    id?: string
    name: string
    code: string
    cvUrl?: string | null
    status?: string
    labourRequestId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    cvUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    labourRequest?: LabourRequestUpdateOneRequiredWithoutCandidatesNestedInput
  }

  export type CandidateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    cvUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    labourRequestId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateCreateManyInput = {
    id?: string
    name: string
    code: string
    cvUrl?: string | null
    status?: string
    labourRequestId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    cvUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    cvUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    labourRequestId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcedureCreateInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    dueDate?: Date | string | null
    completedDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    labourRequest: LabourRequestCreateNestedOneWithoutProceduresInput
  }

  export type ProcedureUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    dueDate?: Date | string | null
    completedDate?: Date | string | null
    labourRequestId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProcedureUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    labourRequest?: LabourRequestUpdateOneRequiredWithoutProceduresNestedInput
  }

  export type ProcedureUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    labourRequestId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcedureCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    dueDate?: Date | string | null
    completedDate?: Date | string | null
    labourRequestId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProcedureUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcedureUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    labourRequestId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type EnumPermissionFilter<$PrismaModel = never> = {
    equals?: $Enums.Permission | EnumPermissionFieldRefInput<$PrismaModel>
    in?: $Enums.Permission[] | ListEnumPermissionFieldRefInput<$PrismaModel>
    notIn?: $Enums.Permission[] | ListEnumPermissionFieldRefInput<$PrismaModel>
    not?: NestedEnumPermissionFilter<$PrismaModel> | $Enums.Permission
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RolePermissionRolePermissionCompoundUniqueInput = {
    role: $Enums.UserRole
    permission: $Enums.Permission
  }

  export type RolePermissionCountOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    permission?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
  }

  export type RolePermissionMaxOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    permission?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
  }

  export type RolePermissionMinOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    permission?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type EnumPermissionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Permission | EnumPermissionFieldRefInput<$PrismaModel>
    in?: $Enums.Permission[] | ListEnumPermissionFieldRefInput<$PrismaModel>
    notIn?: $Enums.Permission[] | ListEnumPermissionFieldRefInput<$PrismaModel>
    not?: NestedEnumPermissionWithAggregatesFilter<$PrismaModel> | $Enums.Permission
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPermissionFilter<$PrismaModel>
    _max?: NestedEnumPermissionFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type CandidateListRelationFilter = {
    every?: CandidateWhereInput
    some?: CandidateWhereInput
    none?: CandidateWhereInput
  }

  export type ProcedureListRelationFilter = {
    every?: ProcedureWhereInput
    some?: ProcedureWhereInput
    none?: ProcedureWhereInput
  }

  export type CandidateOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcedureOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LabourRequestCountOrderByAggregateInput = {
    id?: SortOrder
    jobTitle?: SortOrder
    nationality?: SortOrder
    salary?: SortOrder
    quantity?: SortOrder
    requirements?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type LabourRequestAvgOrderByAggregateInput = {
    salary?: SortOrder
    quantity?: SortOrder
  }

  export type LabourRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    jobTitle?: SortOrder
    nationality?: SortOrder
    salary?: SortOrder
    quantity?: SortOrder
    requirements?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type LabourRequestMinOrderByAggregateInput = {
    id?: SortOrder
    jobTitle?: SortOrder
    nationality?: SortOrder
    salary?: SortOrder
    quantity?: SortOrder
    requirements?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type LabourRequestSumOrderByAggregateInput = {
    salary?: SortOrder
    quantity?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type AgencyCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    email?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgencyMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    email?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgencyMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    email?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RolePermissionListRelationFilter = {
    every?: RolePermissionWhereInput
    some?: RolePermissionWhereInput
    none?: RolePermissionWhereInput
  }

  export type LabourRequestListRelationFilter = {
    every?: LabourRequestWhereInput
    some?: LabourRequestWhereInput
    none?: LabourRequestWhereInput
  }

  export type AgencyListRelationFilter = {
    every?: AgencyWhereInput
    some?: AgencyWhereInput
    none?: AgencyWhereInput
  }

  export type RolePermissionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LabourRequestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgencyOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    name?: SortOrder
    company?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    name?: SortOrder
    company?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    name?: SortOrder
    company?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LabourRequestScalarRelationFilter = {
    is?: LabourRequestWhereInput
    isNot?: LabourRequestWhereInput
  }

  export type CandidateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    cvUrl?: SortOrder
    status?: SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    cvUrl?: SortOrder
    status?: SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    cvUrl?: SortOrder
    status?: SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ProcedureCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    status?: SortOrder
    dueDate?: SortOrder
    completedDate?: SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProcedureMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    status?: SortOrder
    dueDate?: SortOrder
    completedDate?: SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProcedureMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    status?: SortOrder
    dueDate?: SortOrder
    completedDate?: SortOrder
    labourRequestId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserCreateNestedOneWithoutPermissionsInput = {
    create?: XOR<UserCreateWithoutPermissionsInput, UserUncheckedCreateWithoutPermissionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPermissionsInput
    connect?: UserWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type EnumPermissionFieldUpdateOperationsInput = {
    set?: $Enums.Permission
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneWithoutPermissionsNestedInput = {
    create?: XOR<UserCreateWithoutPermissionsInput, UserUncheckedCreateWithoutPermissionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPermissionsInput
    upsert?: UserUpsertWithoutPermissionsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPermissionsInput, UserUpdateWithoutPermissionsInput>, UserUncheckedUpdateWithoutPermissionsInput>
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type UserCreateNestedOneWithoutLabourRequestsInput = {
    create?: XOR<UserCreateWithoutLabourRequestsInput, UserUncheckedCreateWithoutLabourRequestsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLabourRequestsInput
    connect?: UserWhereUniqueInput
  }

  export type CandidateCreateNestedManyWithoutLabourRequestInput = {
    create?: XOR<CandidateCreateWithoutLabourRequestInput, CandidateUncheckedCreateWithoutLabourRequestInput> | CandidateCreateWithoutLabourRequestInput[] | CandidateUncheckedCreateWithoutLabourRequestInput[]
    connectOrCreate?: CandidateCreateOrConnectWithoutLabourRequestInput | CandidateCreateOrConnectWithoutLabourRequestInput[]
    createMany?: CandidateCreateManyLabourRequestInputEnvelope
    connect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
  }

  export type ProcedureCreateNestedManyWithoutLabourRequestInput = {
    create?: XOR<ProcedureCreateWithoutLabourRequestInput, ProcedureUncheckedCreateWithoutLabourRequestInput> | ProcedureCreateWithoutLabourRequestInput[] | ProcedureUncheckedCreateWithoutLabourRequestInput[]
    connectOrCreate?: ProcedureCreateOrConnectWithoutLabourRequestInput | ProcedureCreateOrConnectWithoutLabourRequestInput[]
    createMany?: ProcedureCreateManyLabourRequestInputEnvelope
    connect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
  }

  export type CandidateUncheckedCreateNestedManyWithoutLabourRequestInput = {
    create?: XOR<CandidateCreateWithoutLabourRequestInput, CandidateUncheckedCreateWithoutLabourRequestInput> | CandidateCreateWithoutLabourRequestInput[] | CandidateUncheckedCreateWithoutLabourRequestInput[]
    connectOrCreate?: CandidateCreateOrConnectWithoutLabourRequestInput | CandidateCreateOrConnectWithoutLabourRequestInput[]
    createMany?: CandidateCreateManyLabourRequestInputEnvelope
    connect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
  }

  export type ProcedureUncheckedCreateNestedManyWithoutLabourRequestInput = {
    create?: XOR<ProcedureCreateWithoutLabourRequestInput, ProcedureUncheckedCreateWithoutLabourRequestInput> | ProcedureCreateWithoutLabourRequestInput[] | ProcedureUncheckedCreateWithoutLabourRequestInput[]
    connectOrCreate?: ProcedureCreateOrConnectWithoutLabourRequestInput | ProcedureCreateOrConnectWithoutLabourRequestInput[]
    createMany?: ProcedureCreateManyLabourRequestInputEnvelope
    connect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutLabourRequestsNestedInput = {
    create?: XOR<UserCreateWithoutLabourRequestsInput, UserUncheckedCreateWithoutLabourRequestsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLabourRequestsInput
    upsert?: UserUpsertWithoutLabourRequestsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutLabourRequestsInput, UserUpdateWithoutLabourRequestsInput>, UserUncheckedUpdateWithoutLabourRequestsInput>
  }

  export type CandidateUpdateManyWithoutLabourRequestNestedInput = {
    create?: XOR<CandidateCreateWithoutLabourRequestInput, CandidateUncheckedCreateWithoutLabourRequestInput> | CandidateCreateWithoutLabourRequestInput[] | CandidateUncheckedCreateWithoutLabourRequestInput[]
    connectOrCreate?: CandidateCreateOrConnectWithoutLabourRequestInput | CandidateCreateOrConnectWithoutLabourRequestInput[]
    upsert?: CandidateUpsertWithWhereUniqueWithoutLabourRequestInput | CandidateUpsertWithWhereUniqueWithoutLabourRequestInput[]
    createMany?: CandidateCreateManyLabourRequestInputEnvelope
    set?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    disconnect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    delete?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    connect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    update?: CandidateUpdateWithWhereUniqueWithoutLabourRequestInput | CandidateUpdateWithWhereUniqueWithoutLabourRequestInput[]
    updateMany?: CandidateUpdateManyWithWhereWithoutLabourRequestInput | CandidateUpdateManyWithWhereWithoutLabourRequestInput[]
    deleteMany?: CandidateScalarWhereInput | CandidateScalarWhereInput[]
  }

  export type ProcedureUpdateManyWithoutLabourRequestNestedInput = {
    create?: XOR<ProcedureCreateWithoutLabourRequestInput, ProcedureUncheckedCreateWithoutLabourRequestInput> | ProcedureCreateWithoutLabourRequestInput[] | ProcedureUncheckedCreateWithoutLabourRequestInput[]
    connectOrCreate?: ProcedureCreateOrConnectWithoutLabourRequestInput | ProcedureCreateOrConnectWithoutLabourRequestInput[]
    upsert?: ProcedureUpsertWithWhereUniqueWithoutLabourRequestInput | ProcedureUpsertWithWhereUniqueWithoutLabourRequestInput[]
    createMany?: ProcedureCreateManyLabourRequestInputEnvelope
    set?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    disconnect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    delete?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    connect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    update?: ProcedureUpdateWithWhereUniqueWithoutLabourRequestInput | ProcedureUpdateWithWhereUniqueWithoutLabourRequestInput[]
    updateMany?: ProcedureUpdateManyWithWhereWithoutLabourRequestInput | ProcedureUpdateManyWithWhereWithoutLabourRequestInput[]
    deleteMany?: ProcedureScalarWhereInput | ProcedureScalarWhereInput[]
  }

  export type CandidateUncheckedUpdateManyWithoutLabourRequestNestedInput = {
    create?: XOR<CandidateCreateWithoutLabourRequestInput, CandidateUncheckedCreateWithoutLabourRequestInput> | CandidateCreateWithoutLabourRequestInput[] | CandidateUncheckedCreateWithoutLabourRequestInput[]
    connectOrCreate?: CandidateCreateOrConnectWithoutLabourRequestInput | CandidateCreateOrConnectWithoutLabourRequestInput[]
    upsert?: CandidateUpsertWithWhereUniqueWithoutLabourRequestInput | CandidateUpsertWithWhereUniqueWithoutLabourRequestInput[]
    createMany?: CandidateCreateManyLabourRequestInputEnvelope
    set?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    disconnect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    delete?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    connect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    update?: CandidateUpdateWithWhereUniqueWithoutLabourRequestInput | CandidateUpdateWithWhereUniqueWithoutLabourRequestInput[]
    updateMany?: CandidateUpdateManyWithWhereWithoutLabourRequestInput | CandidateUpdateManyWithWhereWithoutLabourRequestInput[]
    deleteMany?: CandidateScalarWhereInput | CandidateScalarWhereInput[]
  }

  export type ProcedureUncheckedUpdateManyWithoutLabourRequestNestedInput = {
    create?: XOR<ProcedureCreateWithoutLabourRequestInput, ProcedureUncheckedCreateWithoutLabourRequestInput> | ProcedureCreateWithoutLabourRequestInput[] | ProcedureUncheckedCreateWithoutLabourRequestInput[]
    connectOrCreate?: ProcedureCreateOrConnectWithoutLabourRequestInput | ProcedureCreateOrConnectWithoutLabourRequestInput[]
    upsert?: ProcedureUpsertWithWhereUniqueWithoutLabourRequestInput | ProcedureUpsertWithWhereUniqueWithoutLabourRequestInput[]
    createMany?: ProcedureCreateManyLabourRequestInputEnvelope
    set?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    disconnect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    delete?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    connect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    update?: ProcedureUpdateWithWhereUniqueWithoutLabourRequestInput | ProcedureUpdateWithWhereUniqueWithoutLabourRequestInput[]
    updateMany?: ProcedureUpdateManyWithWhereWithoutLabourRequestInput | ProcedureUpdateManyWithWhereWithoutLabourRequestInput[]
    deleteMany?: ProcedureScalarWhereInput | ProcedureScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutAgenciesInput = {
    create?: XOR<UserCreateWithoutAgenciesInput, UserUncheckedCreateWithoutAgenciesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAgenciesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAgenciesNestedInput = {
    create?: XOR<UserCreateWithoutAgenciesInput, UserUncheckedCreateWithoutAgenciesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAgenciesInput
    upsert?: UserUpsertWithoutAgenciesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAgenciesInput, UserUpdateWithoutAgenciesInput>, UserUncheckedUpdateWithoutAgenciesInput>
  }

  export type RolePermissionCreateNestedManyWithoutUserInput = {
    create?: XOR<RolePermissionCreateWithoutUserInput, RolePermissionUncheckedCreateWithoutUserInput> | RolePermissionCreateWithoutUserInput[] | RolePermissionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutUserInput | RolePermissionCreateOrConnectWithoutUserInput[]
    createMany?: RolePermissionCreateManyUserInputEnvelope
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
  }

  export type LabourRequestCreateNestedManyWithoutUserInput = {
    create?: XOR<LabourRequestCreateWithoutUserInput, LabourRequestUncheckedCreateWithoutUserInput> | LabourRequestCreateWithoutUserInput[] | LabourRequestUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LabourRequestCreateOrConnectWithoutUserInput | LabourRequestCreateOrConnectWithoutUserInput[]
    createMany?: LabourRequestCreateManyUserInputEnvelope
    connect?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
  }

  export type AgencyCreateNestedManyWithoutUserInput = {
    create?: XOR<AgencyCreateWithoutUserInput, AgencyUncheckedCreateWithoutUserInput> | AgencyCreateWithoutUserInput[] | AgencyUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutUserInput | AgencyCreateOrConnectWithoutUserInput[]
    createMany?: AgencyCreateManyUserInputEnvelope
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
  }

  export type RolePermissionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<RolePermissionCreateWithoutUserInput, RolePermissionUncheckedCreateWithoutUserInput> | RolePermissionCreateWithoutUserInput[] | RolePermissionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutUserInput | RolePermissionCreateOrConnectWithoutUserInput[]
    createMany?: RolePermissionCreateManyUserInputEnvelope
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
  }

  export type LabourRequestUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<LabourRequestCreateWithoutUserInput, LabourRequestUncheckedCreateWithoutUserInput> | LabourRequestCreateWithoutUserInput[] | LabourRequestUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LabourRequestCreateOrConnectWithoutUserInput | LabourRequestCreateOrConnectWithoutUserInput[]
    createMany?: LabourRequestCreateManyUserInputEnvelope
    connect?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
  }

  export type AgencyUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AgencyCreateWithoutUserInput, AgencyUncheckedCreateWithoutUserInput> | AgencyCreateWithoutUserInput[] | AgencyUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutUserInput | AgencyCreateOrConnectWithoutUserInput[]
    createMany?: AgencyCreateManyUserInputEnvelope
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
  }

  export type RolePermissionUpdateManyWithoutUserNestedInput = {
    create?: XOR<RolePermissionCreateWithoutUserInput, RolePermissionUncheckedCreateWithoutUserInput> | RolePermissionCreateWithoutUserInput[] | RolePermissionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutUserInput | RolePermissionCreateOrConnectWithoutUserInput[]
    upsert?: RolePermissionUpsertWithWhereUniqueWithoutUserInput | RolePermissionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RolePermissionCreateManyUserInputEnvelope
    set?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    disconnect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    delete?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    update?: RolePermissionUpdateWithWhereUniqueWithoutUserInput | RolePermissionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RolePermissionUpdateManyWithWhereWithoutUserInput | RolePermissionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
  }

  export type LabourRequestUpdateManyWithoutUserNestedInput = {
    create?: XOR<LabourRequestCreateWithoutUserInput, LabourRequestUncheckedCreateWithoutUserInput> | LabourRequestCreateWithoutUserInput[] | LabourRequestUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LabourRequestCreateOrConnectWithoutUserInput | LabourRequestCreateOrConnectWithoutUserInput[]
    upsert?: LabourRequestUpsertWithWhereUniqueWithoutUserInput | LabourRequestUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LabourRequestCreateManyUserInputEnvelope
    set?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
    disconnect?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
    delete?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
    connect?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
    update?: LabourRequestUpdateWithWhereUniqueWithoutUserInput | LabourRequestUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LabourRequestUpdateManyWithWhereWithoutUserInput | LabourRequestUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LabourRequestScalarWhereInput | LabourRequestScalarWhereInput[]
  }

  export type AgencyUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgencyCreateWithoutUserInput, AgencyUncheckedCreateWithoutUserInput> | AgencyCreateWithoutUserInput[] | AgencyUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutUserInput | AgencyCreateOrConnectWithoutUserInput[]
    upsert?: AgencyUpsertWithWhereUniqueWithoutUserInput | AgencyUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgencyCreateManyUserInputEnvelope
    set?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    disconnect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    delete?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    update?: AgencyUpdateWithWhereUniqueWithoutUserInput | AgencyUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgencyUpdateManyWithWhereWithoutUserInput | AgencyUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
  }

  export type RolePermissionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<RolePermissionCreateWithoutUserInput, RolePermissionUncheckedCreateWithoutUserInput> | RolePermissionCreateWithoutUserInput[] | RolePermissionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutUserInput | RolePermissionCreateOrConnectWithoutUserInput[]
    upsert?: RolePermissionUpsertWithWhereUniqueWithoutUserInput | RolePermissionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RolePermissionCreateManyUserInputEnvelope
    set?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    disconnect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    delete?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    update?: RolePermissionUpdateWithWhereUniqueWithoutUserInput | RolePermissionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RolePermissionUpdateManyWithWhereWithoutUserInput | RolePermissionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
  }

  export type LabourRequestUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<LabourRequestCreateWithoutUserInput, LabourRequestUncheckedCreateWithoutUserInput> | LabourRequestCreateWithoutUserInput[] | LabourRequestUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LabourRequestCreateOrConnectWithoutUserInput | LabourRequestCreateOrConnectWithoutUserInput[]
    upsert?: LabourRequestUpsertWithWhereUniqueWithoutUserInput | LabourRequestUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LabourRequestCreateManyUserInputEnvelope
    set?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
    disconnect?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
    delete?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
    connect?: LabourRequestWhereUniqueInput | LabourRequestWhereUniqueInput[]
    update?: LabourRequestUpdateWithWhereUniqueWithoutUserInput | LabourRequestUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LabourRequestUpdateManyWithWhereWithoutUserInput | LabourRequestUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LabourRequestScalarWhereInput | LabourRequestScalarWhereInput[]
  }

  export type AgencyUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgencyCreateWithoutUserInput, AgencyUncheckedCreateWithoutUserInput> | AgencyCreateWithoutUserInput[] | AgencyUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutUserInput | AgencyCreateOrConnectWithoutUserInput[]
    upsert?: AgencyUpsertWithWhereUniqueWithoutUserInput | AgencyUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgencyCreateManyUserInputEnvelope
    set?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    disconnect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    delete?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    update?: AgencyUpdateWithWhereUniqueWithoutUserInput | AgencyUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgencyUpdateManyWithWhereWithoutUserInput | AgencyUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
  }

  export type LabourRequestCreateNestedOneWithoutCandidatesInput = {
    create?: XOR<LabourRequestCreateWithoutCandidatesInput, LabourRequestUncheckedCreateWithoutCandidatesInput>
    connectOrCreate?: LabourRequestCreateOrConnectWithoutCandidatesInput
    connect?: LabourRequestWhereUniqueInput
  }

  export type LabourRequestUpdateOneRequiredWithoutCandidatesNestedInput = {
    create?: XOR<LabourRequestCreateWithoutCandidatesInput, LabourRequestUncheckedCreateWithoutCandidatesInput>
    connectOrCreate?: LabourRequestCreateOrConnectWithoutCandidatesInput
    upsert?: LabourRequestUpsertWithoutCandidatesInput
    connect?: LabourRequestWhereUniqueInput
    update?: XOR<XOR<LabourRequestUpdateToOneWithWhereWithoutCandidatesInput, LabourRequestUpdateWithoutCandidatesInput>, LabourRequestUncheckedUpdateWithoutCandidatesInput>
  }

  export type LabourRequestCreateNestedOneWithoutProceduresInput = {
    create?: XOR<LabourRequestCreateWithoutProceduresInput, LabourRequestUncheckedCreateWithoutProceduresInput>
    connectOrCreate?: LabourRequestCreateOrConnectWithoutProceduresInput
    connect?: LabourRequestWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type LabourRequestUpdateOneRequiredWithoutProceduresNestedInput = {
    create?: XOR<LabourRequestCreateWithoutProceduresInput, LabourRequestUncheckedCreateWithoutProceduresInput>
    connectOrCreate?: LabourRequestCreateOrConnectWithoutProceduresInput
    upsert?: LabourRequestUpsertWithoutProceduresInput
    connect?: LabourRequestWhereUniqueInput
    update?: XOR<XOR<LabourRequestUpdateToOneWithWhereWithoutProceduresInput, LabourRequestUpdateWithoutProceduresInput>, LabourRequestUncheckedUpdateWithoutProceduresInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedEnumPermissionFilter<$PrismaModel = never> = {
    equals?: $Enums.Permission | EnumPermissionFieldRefInput<$PrismaModel>
    in?: $Enums.Permission[] | ListEnumPermissionFieldRefInput<$PrismaModel>
    notIn?: $Enums.Permission[] | ListEnumPermissionFieldRefInput<$PrismaModel>
    not?: NestedEnumPermissionFilter<$PrismaModel> | $Enums.Permission
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedEnumPermissionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Permission | EnumPermissionFieldRefInput<$PrismaModel>
    in?: $Enums.Permission[] | ListEnumPermissionFieldRefInput<$PrismaModel>
    notIn?: $Enums.Permission[] | ListEnumPermissionFieldRefInput<$PrismaModel>
    not?: NestedEnumPermissionWithAggregatesFilter<$PrismaModel> | $Enums.Permission
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPermissionFilter<$PrismaModel>
    _max?: NestedEnumPermissionFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserCreateWithoutPermissionsInput = {
    id?: string
    email: string
    password: string
    role: $Enums.UserRole
    name?: string | null
    company?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    labourRequests?: LabourRequestCreateNestedManyWithoutUserInput
    agencies?: AgencyCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPermissionsInput = {
    id?: string
    email: string
    password: string
    role: $Enums.UserRole
    name?: string | null
    company?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    labourRequests?: LabourRequestUncheckedCreateNestedManyWithoutUserInput
    agencies?: AgencyUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPermissionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPermissionsInput, UserUncheckedCreateWithoutPermissionsInput>
  }

  export type UserUpsertWithoutPermissionsInput = {
    update: XOR<UserUpdateWithoutPermissionsInput, UserUncheckedUpdateWithoutPermissionsInput>
    create: XOR<UserCreateWithoutPermissionsInput, UserUncheckedCreateWithoutPermissionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPermissionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPermissionsInput, UserUncheckedUpdateWithoutPermissionsInput>
  }

  export type UserUpdateWithoutPermissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    labourRequests?: LabourRequestUpdateManyWithoutUserNestedInput
    agencies?: AgencyUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPermissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    labourRequests?: LabourRequestUncheckedUpdateManyWithoutUserNestedInput
    agencies?: AgencyUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutLabourRequestsInput = {
    id?: string
    email: string
    password: string
    role: $Enums.UserRole
    name?: string | null
    company?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionCreateNestedManyWithoutUserInput
    agencies?: AgencyCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutLabourRequestsInput = {
    id?: string
    email: string
    password: string
    role: $Enums.UserRole
    name?: string | null
    company?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionUncheckedCreateNestedManyWithoutUserInput
    agencies?: AgencyUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutLabourRequestsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutLabourRequestsInput, UserUncheckedCreateWithoutLabourRequestsInput>
  }

  export type CandidateCreateWithoutLabourRequestInput = {
    id?: string
    name: string
    code: string
    cvUrl?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateUncheckedCreateWithoutLabourRequestInput = {
    id?: string
    name: string
    code: string
    cvUrl?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateCreateOrConnectWithoutLabourRequestInput = {
    where: CandidateWhereUniqueInput
    create: XOR<CandidateCreateWithoutLabourRequestInput, CandidateUncheckedCreateWithoutLabourRequestInput>
  }

  export type CandidateCreateManyLabourRequestInputEnvelope = {
    data: CandidateCreateManyLabourRequestInput | CandidateCreateManyLabourRequestInput[]
    skipDuplicates?: boolean
  }

  export type ProcedureCreateWithoutLabourRequestInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    dueDate?: Date | string | null
    completedDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProcedureUncheckedCreateWithoutLabourRequestInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    dueDate?: Date | string | null
    completedDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProcedureCreateOrConnectWithoutLabourRequestInput = {
    where: ProcedureWhereUniqueInput
    create: XOR<ProcedureCreateWithoutLabourRequestInput, ProcedureUncheckedCreateWithoutLabourRequestInput>
  }

  export type ProcedureCreateManyLabourRequestInputEnvelope = {
    data: ProcedureCreateManyLabourRequestInput | ProcedureCreateManyLabourRequestInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutLabourRequestsInput = {
    update: XOR<UserUpdateWithoutLabourRequestsInput, UserUncheckedUpdateWithoutLabourRequestsInput>
    create: XOR<UserCreateWithoutLabourRequestsInput, UserUncheckedCreateWithoutLabourRequestsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutLabourRequestsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutLabourRequestsInput, UserUncheckedUpdateWithoutLabourRequestsInput>
  }

  export type UserUpdateWithoutLabourRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUpdateManyWithoutUserNestedInput
    agencies?: AgencyUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutLabourRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUncheckedUpdateManyWithoutUserNestedInput
    agencies?: AgencyUncheckedUpdateManyWithoutUserNestedInput
  }

  export type CandidateUpsertWithWhereUniqueWithoutLabourRequestInput = {
    where: CandidateWhereUniqueInput
    update: XOR<CandidateUpdateWithoutLabourRequestInput, CandidateUncheckedUpdateWithoutLabourRequestInput>
    create: XOR<CandidateCreateWithoutLabourRequestInput, CandidateUncheckedCreateWithoutLabourRequestInput>
  }

  export type CandidateUpdateWithWhereUniqueWithoutLabourRequestInput = {
    where: CandidateWhereUniqueInput
    data: XOR<CandidateUpdateWithoutLabourRequestInput, CandidateUncheckedUpdateWithoutLabourRequestInput>
  }

  export type CandidateUpdateManyWithWhereWithoutLabourRequestInput = {
    where: CandidateScalarWhereInput
    data: XOR<CandidateUpdateManyMutationInput, CandidateUncheckedUpdateManyWithoutLabourRequestInput>
  }

  export type CandidateScalarWhereInput = {
    AND?: CandidateScalarWhereInput | CandidateScalarWhereInput[]
    OR?: CandidateScalarWhereInput[]
    NOT?: CandidateScalarWhereInput | CandidateScalarWhereInput[]
    id?: StringFilter<"Candidate"> | string
    name?: StringFilter<"Candidate"> | string
    code?: StringFilter<"Candidate"> | string
    cvUrl?: StringNullableFilter<"Candidate"> | string | null
    status?: StringFilter<"Candidate"> | string
    labourRequestId?: StringFilter<"Candidate"> | string
    createdAt?: DateTimeFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeFilter<"Candidate"> | Date | string
  }

  export type ProcedureUpsertWithWhereUniqueWithoutLabourRequestInput = {
    where: ProcedureWhereUniqueInput
    update: XOR<ProcedureUpdateWithoutLabourRequestInput, ProcedureUncheckedUpdateWithoutLabourRequestInput>
    create: XOR<ProcedureCreateWithoutLabourRequestInput, ProcedureUncheckedCreateWithoutLabourRequestInput>
  }

  export type ProcedureUpdateWithWhereUniqueWithoutLabourRequestInput = {
    where: ProcedureWhereUniqueInput
    data: XOR<ProcedureUpdateWithoutLabourRequestInput, ProcedureUncheckedUpdateWithoutLabourRequestInput>
  }

  export type ProcedureUpdateManyWithWhereWithoutLabourRequestInput = {
    where: ProcedureScalarWhereInput
    data: XOR<ProcedureUpdateManyMutationInput, ProcedureUncheckedUpdateManyWithoutLabourRequestInput>
  }

  export type ProcedureScalarWhereInput = {
    AND?: ProcedureScalarWhereInput | ProcedureScalarWhereInput[]
    OR?: ProcedureScalarWhereInput[]
    NOT?: ProcedureScalarWhereInput | ProcedureScalarWhereInput[]
    id?: StringFilter<"Procedure"> | string
    name?: StringFilter<"Procedure"> | string
    description?: StringNullableFilter<"Procedure"> | string | null
    status?: StringFilter<"Procedure"> | string
    dueDate?: DateTimeNullableFilter<"Procedure"> | Date | string | null
    completedDate?: DateTimeNullableFilter<"Procedure"> | Date | string | null
    labourRequestId?: StringFilter<"Procedure"> | string
    createdAt?: DateTimeFilter<"Procedure"> | Date | string
    updatedAt?: DateTimeFilter<"Procedure"> | Date | string
  }

  export type UserCreateWithoutAgenciesInput = {
    id?: string
    email: string
    password: string
    role: $Enums.UserRole
    name?: string | null
    company?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionCreateNestedManyWithoutUserInput
    labourRequests?: LabourRequestCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAgenciesInput = {
    id?: string
    email: string
    password: string
    role: $Enums.UserRole
    name?: string | null
    company?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionUncheckedCreateNestedManyWithoutUserInput
    labourRequests?: LabourRequestUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAgenciesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAgenciesInput, UserUncheckedCreateWithoutAgenciesInput>
  }

  export type UserUpsertWithoutAgenciesInput = {
    update: XOR<UserUpdateWithoutAgenciesInput, UserUncheckedUpdateWithoutAgenciesInput>
    create: XOR<UserCreateWithoutAgenciesInput, UserUncheckedCreateWithoutAgenciesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAgenciesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAgenciesInput, UserUncheckedUpdateWithoutAgenciesInput>
  }

  export type UserUpdateWithoutAgenciesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUpdateManyWithoutUserNestedInput
    labourRequests?: LabourRequestUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAgenciesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    name?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUncheckedUpdateManyWithoutUserNestedInput
    labourRequests?: LabourRequestUncheckedUpdateManyWithoutUserNestedInput
  }

  export type RolePermissionCreateWithoutUserInput = {
    id?: string
    role: $Enums.UserRole
    permission: $Enums.Permission
    createdAt?: Date | string
  }

  export type RolePermissionUncheckedCreateWithoutUserInput = {
    id?: string
    role: $Enums.UserRole
    permission: $Enums.Permission
    createdAt?: Date | string
  }

  export type RolePermissionCreateOrConnectWithoutUserInput = {
    where: RolePermissionWhereUniqueInput
    create: XOR<RolePermissionCreateWithoutUserInput, RolePermissionUncheckedCreateWithoutUserInput>
  }

  export type RolePermissionCreateManyUserInputEnvelope = {
    data: RolePermissionCreateManyUserInput | RolePermissionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type LabourRequestCreateWithoutUserInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    candidates?: CandidateCreateNestedManyWithoutLabourRequestInput
    procedures?: ProcedureCreateNestedManyWithoutLabourRequestInput
  }

  export type LabourRequestUncheckedCreateWithoutUserInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    candidates?: CandidateUncheckedCreateNestedManyWithoutLabourRequestInput
    procedures?: ProcedureUncheckedCreateNestedManyWithoutLabourRequestInput
  }

  export type LabourRequestCreateOrConnectWithoutUserInput = {
    where: LabourRequestWhereUniqueInput
    create: XOR<LabourRequestCreateWithoutUserInput, LabourRequestUncheckedCreateWithoutUserInput>
  }

  export type LabourRequestCreateManyUserInputEnvelope = {
    data: LabourRequestCreateManyUserInput | LabourRequestCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AgencyCreateWithoutUserInput = {
    id?: string
    name: string
    contact: string
    email: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgencyUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    contact: string
    email: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgencyCreateOrConnectWithoutUserInput = {
    where: AgencyWhereUniqueInput
    create: XOR<AgencyCreateWithoutUserInput, AgencyUncheckedCreateWithoutUserInput>
  }

  export type AgencyCreateManyUserInputEnvelope = {
    data: AgencyCreateManyUserInput | AgencyCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type RolePermissionUpsertWithWhereUniqueWithoutUserInput = {
    where: RolePermissionWhereUniqueInput
    update: XOR<RolePermissionUpdateWithoutUserInput, RolePermissionUncheckedUpdateWithoutUserInput>
    create: XOR<RolePermissionCreateWithoutUserInput, RolePermissionUncheckedCreateWithoutUserInput>
  }

  export type RolePermissionUpdateWithWhereUniqueWithoutUserInput = {
    where: RolePermissionWhereUniqueInput
    data: XOR<RolePermissionUpdateWithoutUserInput, RolePermissionUncheckedUpdateWithoutUserInput>
  }

  export type RolePermissionUpdateManyWithWhereWithoutUserInput = {
    where: RolePermissionScalarWhereInput
    data: XOR<RolePermissionUpdateManyMutationInput, RolePermissionUncheckedUpdateManyWithoutUserInput>
  }

  export type RolePermissionScalarWhereInput = {
    AND?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
    OR?: RolePermissionScalarWhereInput[]
    NOT?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
    id?: StringFilter<"RolePermission"> | string
    role?: EnumUserRoleFilter<"RolePermission"> | $Enums.UserRole
    permission?: EnumPermissionFilter<"RolePermission"> | $Enums.Permission
    createdAt?: DateTimeFilter<"RolePermission"> | Date | string
    userId?: StringNullableFilter<"RolePermission"> | string | null
  }

  export type LabourRequestUpsertWithWhereUniqueWithoutUserInput = {
    where: LabourRequestWhereUniqueInput
    update: XOR<LabourRequestUpdateWithoutUserInput, LabourRequestUncheckedUpdateWithoutUserInput>
    create: XOR<LabourRequestCreateWithoutUserInput, LabourRequestUncheckedCreateWithoutUserInput>
  }

  export type LabourRequestUpdateWithWhereUniqueWithoutUserInput = {
    where: LabourRequestWhereUniqueInput
    data: XOR<LabourRequestUpdateWithoutUserInput, LabourRequestUncheckedUpdateWithoutUserInput>
  }

  export type LabourRequestUpdateManyWithWhereWithoutUserInput = {
    where: LabourRequestScalarWhereInput
    data: XOR<LabourRequestUpdateManyMutationInput, LabourRequestUncheckedUpdateManyWithoutUserInput>
  }

  export type LabourRequestScalarWhereInput = {
    AND?: LabourRequestScalarWhereInput | LabourRequestScalarWhereInput[]
    OR?: LabourRequestScalarWhereInput[]
    NOT?: LabourRequestScalarWhereInput | LabourRequestScalarWhereInput[]
    id?: StringFilter<"LabourRequest"> | string
    jobTitle?: StringFilter<"LabourRequest"> | string
    nationality?: StringFilter<"LabourRequest"> | string
    salary?: FloatFilter<"LabourRequest"> | number
    quantity?: IntFilter<"LabourRequest"> | number
    requirements?: StringFilter<"LabourRequest"> | string
    status?: StringFilter<"LabourRequest"> | string
    createdAt?: DateTimeFilter<"LabourRequest"> | Date | string
    updatedAt?: DateTimeFilter<"LabourRequest"> | Date | string
    userId?: StringFilter<"LabourRequest"> | string
  }

  export type AgencyUpsertWithWhereUniqueWithoutUserInput = {
    where: AgencyWhereUniqueInput
    update: XOR<AgencyUpdateWithoutUserInput, AgencyUncheckedUpdateWithoutUserInput>
    create: XOR<AgencyCreateWithoutUserInput, AgencyUncheckedCreateWithoutUserInput>
  }

  export type AgencyUpdateWithWhereUniqueWithoutUserInput = {
    where: AgencyWhereUniqueInput
    data: XOR<AgencyUpdateWithoutUserInput, AgencyUncheckedUpdateWithoutUserInput>
  }

  export type AgencyUpdateManyWithWhereWithoutUserInput = {
    where: AgencyScalarWhereInput
    data: XOR<AgencyUpdateManyMutationInput, AgencyUncheckedUpdateManyWithoutUserInput>
  }

  export type AgencyScalarWhereInput = {
    AND?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
    OR?: AgencyScalarWhereInput[]
    NOT?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
    id?: StringFilter<"Agency"> | string
    name?: StringFilter<"Agency"> | string
    contact?: StringFilter<"Agency"> | string
    email?: StringFilter<"Agency"> | string
    userId?: StringFilter<"Agency"> | string
    createdAt?: DateTimeFilter<"Agency"> | Date | string
    updatedAt?: DateTimeFilter<"Agency"> | Date | string
  }

  export type LabourRequestCreateWithoutCandidatesInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutLabourRequestsInput
    procedures?: ProcedureCreateNestedManyWithoutLabourRequestInput
  }

  export type LabourRequestUncheckedCreateWithoutCandidatesInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    procedures?: ProcedureUncheckedCreateNestedManyWithoutLabourRequestInput
  }

  export type LabourRequestCreateOrConnectWithoutCandidatesInput = {
    where: LabourRequestWhereUniqueInput
    create: XOR<LabourRequestCreateWithoutCandidatesInput, LabourRequestUncheckedCreateWithoutCandidatesInput>
  }

  export type LabourRequestUpsertWithoutCandidatesInput = {
    update: XOR<LabourRequestUpdateWithoutCandidatesInput, LabourRequestUncheckedUpdateWithoutCandidatesInput>
    create: XOR<LabourRequestCreateWithoutCandidatesInput, LabourRequestUncheckedCreateWithoutCandidatesInput>
    where?: LabourRequestWhereInput
  }

  export type LabourRequestUpdateToOneWithWhereWithoutCandidatesInput = {
    where?: LabourRequestWhereInput
    data: XOR<LabourRequestUpdateWithoutCandidatesInput, LabourRequestUncheckedUpdateWithoutCandidatesInput>
  }

  export type LabourRequestUpdateWithoutCandidatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLabourRequestsNestedInput
    procedures?: ProcedureUpdateManyWithoutLabourRequestNestedInput
  }

  export type LabourRequestUncheckedUpdateWithoutCandidatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    procedures?: ProcedureUncheckedUpdateManyWithoutLabourRequestNestedInput
  }

  export type LabourRequestCreateWithoutProceduresInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutLabourRequestsInput
    candidates?: CandidateCreateNestedManyWithoutLabourRequestInput
  }

  export type LabourRequestUncheckedCreateWithoutProceduresInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    candidates?: CandidateUncheckedCreateNestedManyWithoutLabourRequestInput
  }

  export type LabourRequestCreateOrConnectWithoutProceduresInput = {
    where: LabourRequestWhereUniqueInput
    create: XOR<LabourRequestCreateWithoutProceduresInput, LabourRequestUncheckedCreateWithoutProceduresInput>
  }

  export type LabourRequestUpsertWithoutProceduresInput = {
    update: XOR<LabourRequestUpdateWithoutProceduresInput, LabourRequestUncheckedUpdateWithoutProceduresInput>
    create: XOR<LabourRequestCreateWithoutProceduresInput, LabourRequestUncheckedCreateWithoutProceduresInput>
    where?: LabourRequestWhereInput
  }

  export type LabourRequestUpdateToOneWithWhereWithoutProceduresInput = {
    where?: LabourRequestWhereInput
    data: XOR<LabourRequestUpdateWithoutProceduresInput, LabourRequestUncheckedUpdateWithoutProceduresInput>
  }

  export type LabourRequestUpdateWithoutProceduresInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLabourRequestsNestedInput
    candidates?: CandidateUpdateManyWithoutLabourRequestNestedInput
  }

  export type LabourRequestUncheckedUpdateWithoutProceduresInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    candidates?: CandidateUncheckedUpdateManyWithoutLabourRequestNestedInput
  }

  export type CandidateCreateManyLabourRequestInput = {
    id?: string
    name: string
    code: string
    cvUrl?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProcedureCreateManyLabourRequestInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    dueDate?: Date | string | null
    completedDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateUpdateWithoutLabourRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    cvUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateUncheckedUpdateWithoutLabourRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    cvUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateUncheckedUpdateManyWithoutLabourRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    cvUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcedureUpdateWithoutLabourRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcedureUncheckedUpdateWithoutLabourRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcedureUncheckedUpdateManyWithoutLabourRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionCreateManyUserInput = {
    id?: string
    role: $Enums.UserRole
    permission: $Enums.Permission
    createdAt?: Date | string
  }

  export type LabourRequestCreateManyUserInput = {
    id?: string
    jobTitle: string
    nationality: string
    salary: number
    quantity: number
    requirements: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgencyCreateManyUserInput = {
    id?: string
    name: string
    contact: string
    email: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RolePermissionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LabourRequestUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidates?: CandidateUpdateManyWithoutLabourRequestNestedInput
    procedures?: ProcedureUpdateManyWithoutLabourRequestNestedInput
  }

  export type LabourRequestUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidates?: CandidateUncheckedUpdateManyWithoutLabourRequestNestedInput
    procedures?: ProcedureUncheckedUpdateManyWithoutLabourRequestNestedInput
  }

  export type LabourRequestUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    salary?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    requirements?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgencyUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgencyUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgencyUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}