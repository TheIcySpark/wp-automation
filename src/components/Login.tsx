import { Button, Center, Input, Tag, VStack, useToast } from "@chakra-ui/react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React from "react";

interface IProps{
  setAuthUser: any;
}

export default function Login(props: IProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const toast = useToast()


  function onLoginButtonClick() {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        props.setAuthUser(userCredential.user);
        toast({
          title: 'Accedio a la cuenta',
          status: 'success',
          duration: 4000,
          isClosable: true,
        })
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      });
  }

  return (
    <Center>
      <VStack>
        <Tag colorScheme="green">Login</Tag>
        <Input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)}></Input>
        <Input placeholder="Contraseña" type="password" onChange={(e) => setPassword(e.target.value)}></Input>
        <Button colorScheme="green" onClick={onLoginButtonClick}>Ingresar</Button>
      </VStack>
    </Center>
  )
}