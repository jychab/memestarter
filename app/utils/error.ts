import { IDL as SafePresaleIdl } from "./idl";
export function getCustomErrorMessage(errorMessage: any) {
  const customErrorExpression =
    /.*custom program error: 0x(?<errorNumber>[0-9abcdef]+)/;
  let match = customErrorExpression.exec(errorMessage);
  const errorNumberFound = match?.groups?.errorNumber;
  if (!errorNumberFound) {
    return errorMessage;
  }
  const errorNumber = parseInt(errorNumberFound, 16);
  return (
    SafePresaleIdl.errors.find((err) => err.code === errorNumber)?.msg ||
    errorMessage
  );
}
