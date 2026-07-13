export class Pattern {
  static number = /[0-9+\- ]/;
  static passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,8}$/;
  static email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  static latitude = /^[\+\-]?\d*\,\d+(?:[Ee][\+\-]?\d+)?$/;
  static numberCurrency = /\D/g;
  static formatReturnCurrency = /\B(?=(\d{3})+(?!\d))/g;
  static phoneMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  static LOCATION = /^([-+]?\d{1,2}([.]\d+)?),\s*([-+]?\d{1,3}([.]\d+)?)$/;
}
