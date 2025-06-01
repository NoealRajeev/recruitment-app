// import pino from "pino";

// const isDevelopment = process.env.NODE_ENV === "development";

// const pinoConfig = {
//   level: process.env.LOG_LEVEL || "info",
//   formatters: {
//     level: (label: string) => ({ level: label }),
//   },
//   ...(isDevelopment
//     ? {
//         transport: {
//           target: "pino-pretty",
//           options: {
//             colorize: true,
//             translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
//             ignore: "pid,hostname",
//           },
//         },
//       }
//     : {}),
// };

// const logger = pino(pinoConfig);

// export const log = {
//   info: (message: string, context?: Record<string, unknown>) =>
//     logger.info(context, message),
//   warn: (message: string, context?: Record<string, unknown>) =>
//     logger.warn(context, message),
//   error: (message: string, context?: Record<string, unknown>) =>
//     logger.error(context, message),
//   debug: (message: string, context?: Record<string, unknown>) =>
//     logger.debug(context, message),
//   audit: (action: string, entity: string, details: Record<string, unknown>) => {
//     logger.info(
//       {
//         type: "AUDIT",
//         action,
//         entity,
//         ...details,
//       },
//       `Audit: ${action} on ${entity}`
//     );
//   },
// };
