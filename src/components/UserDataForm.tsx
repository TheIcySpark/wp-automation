import { HStack, Input, Text } from "@chakra-ui/react"
import * as React from "react"
import ClientCheckListData from "./ClientCheckListData"
import IUserDataForm from "./IUserDataForm"
import { useEffect, useRef } from "react"

interface IProps {
  userData: IUserDataForm
  setUserData: React.Dispatch<React.SetStateAction<IUserDataForm>>,
  isNumberDisabled?: boolean
}

export default function UserDataForm(props: IProps) {
  const labelWidth = 200
  const inputWidth = 300
  const HStackSpacing = 1

  const checkListDescriptions = [
    'DNI', 'Licencia de conducir', 'Cedula verde', 'Fotos de nuestro vehiculo',
    'Certificado de cobertura', 'Denuncia de siniestro', 'Relato de los hechos',
    'declaracion de no seguro', 'Presupuesto', 'Documentacion medica', 'Estudios medicos',
    'Historia clinica', 'Doc. del requerido', 'Fotos del hecho'
  ]

  function setCheckListOption(index: number, value: string) {
    let checkListOptions = props.userData.checkListOptions
    checkListOptions[index] = {name: checkListDescriptions[index], value: value}
    const newData: IUserDataForm = {
      name: props.userData.name,
      number: props.userData.number,
      checkListOptions: checkListOptions,
      messages: props.userData.messages
    }
    props.setUserData(newData);
  }

  function setUserName(event: any) {
    const newData: IUserDataForm = {
      name: event.target.value,
      number: props.userData.number,
      checkListOptions: props.userData.checkListOptions,
      messages: props.userData.messages
    }
    props.setUserData(newData);
  }

  function setUserNumber(event: any) {
    const newData: IUserDataForm = {
      name: props.userData.name,
      number: event.target.value,
      checkListOptions: props.userData.checkListOptions,
      messages: props.userData.messages
    }
    props.setUserData(newData);
  }

  return (
    <>
      <HStack spacing={HStackSpacing} mb={1}>
        <Text width={labelWidth}>Nombre de cliente</Text>
        <Input width={inputWidth} type="text" onChange={setUserName} defaultValue={props.userData.name}></Input>
      </HStack>
      <HStack spacing={HStackSpacing} mb={1}>
        <Text width={labelWidth}>Numero de cliente</Text>
        <Input width={inputWidth} type="number" onChange={setUserNumber} 
        defaultValue={props.userData.number} disabled={props.isNumberDisabled}
        />
      </HStack>

        { checkListDescriptions.map((item, index) => {
          return (
            <HStack key={index} spacing={HStackSpacing} mb={1}>
              <Text width={labelWidth}>{item}</Text>
              <ClientCheckListData 
              width={inputWidth} setCheckListOption={setCheckListOption} index={index} 
              defaultValue={props.userData.checkListOptions[index].value}
              />
            </HStack>
          )
        })}

    </>
  )
}