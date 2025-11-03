export class EmailAlreadyExistsError extends Error {
  constructor(message: string = "El email ya está en uso") {
    super(message);
    this.name = "EmailAlreadyExistsError";
  }
}

export class InvalidEmailError extends Error {
  constructor(message: string = "El formato del email no es válido") {
    super(message);
    this.name = "InvalidEmailError";
  }
}
