import { HStack, Radio, RadioGroup } from "@chakra-ui/react";

interface IProps{
  index: number
  width: number
  defaultValue: string
  setCheckListOption(index: number, value: string): void
}
export default function ClientCheckListData(props: IProps) {

  return(
    <RadioGroup width={props.width} defaultValue={props.defaultValue} onChange={(event) => props.setCheckListOption(props.index, event)}>
    <HStack>
      <Radio value="positivo">Positivo</Radio>
      <Radio value="negativo">Negativo</Radio>
      <Radio value="noNecesario">No necesario</Radio>
    </HStack>
  </RadioGroup>
  )
}