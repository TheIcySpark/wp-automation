export default interface IUserDataForm{
  name: string;
  number: number | undefined;
  checkListOptions: {name: string, value: string}[];
  messages: string[];
}