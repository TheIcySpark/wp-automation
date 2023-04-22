import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Center, Flex, Grid, GridItem, HStack, IconButton, Input, InputGroup, InputRightElement, Spacer, Tag, Text, VStack, useDisclosure, useToast } from "@chakra-ui/react";
import UserDataForm from "./UserDataForm";
import { getDatabase, ref, onValue, remove, off, get, child, set } from "firebase/database";
import React from "react";
import { useEffect } from 'react';
import IUserDataForm from "./IUserDataForm";
import { FaSearch, FaTrash } from "react-icons/fa";

interface IProps {
  updateUser(userData: IUserDataForm): void
}

export default function UserLayout(props: IProps) {
  const [userData, setUserData] = React.useState<IUserDataForm>({ name: '', number: undefined, checkListOptions: [], messages: [] });
  const [newUserData, setNewUserData] = React.useState<IUserDataForm>({ name: '', number: undefined, checkListOptions: [], messages: new Array(0) });
  const [messageDate, setMessageDate] = React.useState('');
  const [customMessage, setCustomMessage] = React.useState('');
  const [usersFromDatabase, setUsersFromDatabase] = React.useState<IUserDataForm[]>([]);
  const [filteredUsersFromDatabase, setFilteredUsersFromDatabase] = React.useState<IUserDataForm[]>([]);
  const [selectedUser, setSelectedUser] = React.useState(-1);
  const [currentFilter, setCurrentFilter] = React.useState('');


  const toast = useToast()
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure()
  const cancelAlertRef = React.useRef(null)


  useEffect(() => {
    const database = getDatabase();
    const databaseRef = ref(database, 'users');
    onValue(databaseRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array_data = Object.keys(data).map((key) => data[key]);
        const sorted_array_data = array_data.sort((a, b) => a.name.localeCompare(b.name));
        setUsersFromDatabase(sorted_array_data);
        setFilteredUsersFromDatabase(sorted_array_data.filter((user) => user.name.toLowerCase().includes(currentFilter.toLowerCase())));
      } else {
        setUsersFromDatabase([])
      }
    })
    return () => {
      off(databaseRef);
    }
  },);

  useEffect(() => {
    const database = getDatabase();
    const databaseRef = ref(database);
    get(child(databaseRef, 'users')).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array_data = Object.keys(data).map((key) => data[key]);
        const sorted_array_data = array_data.sort((a, b) => a.name.localeCompare(b.name));
        setFilteredUsersFromDatabase(sorted_array_data);
      }
    })
  }, [])


  function selectUser(index: number) {
    setSelectedUser(-1);
    setTimeout(() => {
      setSelectedUser(index);
      setUserData(filteredUsersFromDatabase[index]);
      setNewUserData(filteredUsersFromDatabase[index]);
      setMessageDate('');
      setCustomMessage('');
    }, 1);
  }

  function deleteUser(userNumber: number) {
    const database = getDatabase();
    remove(ref(database, 'users/' + userNumber))
      .then(() => {
        toast({
          title: 'Eliminado',
          description: "Cliente eliminado",
          status: 'success',
          duration: 4000,
          isClosable: true,
        })
      })
      .catch((error) => {
        toast({
          title: 'Error al eliminar al cliente.',
          description: error.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      })
    onDeleteAlertClose()
    selectUser(0);
  }

  function filterUsers(e: React.ChangeEvent<HTMLInputElement>) {
    setCurrentFilter(e.target.value);
    setFilteredUsersFromDatabase(usersFromDatabase.filter((user) => user.name.toLowerCase().includes(e.target.value.toLowerCase())));
  }

  function handleDateInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMessageDate(e.target.value);
  }

  function saveMessage(message: string) {
    if (messageDate === '') {
      toast({
        title: 'Error',
        description: "Debe ingresar una fecha",
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
      return;
    }
    if (!newUserData.messages) {
      newUserData.messages = [];
    }
    newUserData.messages.push(message + '&&' + messageDate);
    props.updateUser(newUserData);
  }

  function deleteMessage(index: number) {
    newUserData.messages.splice(index, 1);
    props.updateUser(newUserData);
  }

  function testFunction() {
    const database = getDatabase();
    const databaseRef = ref(database);
    get(child(databaseRef, 'users')).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array_data = Object.keys(data).map((key) => data[key]);
        for (let userIndex = 0; userIndex < array_data.length; userIndex++) {
          if (array_data[userIndex].messages) {
            for (let messageIndex = 0; messageIndex < array_data[userIndex].messages.length; messageIndex++) {
              const date = new Date(array_data[userIndex].messages[messageIndex].split('&&')[1]);
              if (date.getTime() < new Date().getTime()) {
                let messageToSend = ''
                let templateName = '';
                if (array_data[userIndex].messages[messageIndex].split('&&')[0] === '<Automatico>') {
                  templateName = 'automatic_message';
                  array_data[userIndex].checkListOptions.forEach((checkListOption: { name: string, value: string }) => {
                    if (checkListOption.value === 'negativo') {
                      if (messageToSend) {
                        messageToSend += ', '
                      }
                      messageToSend += checkListOption.name;
                    }
                  })
                } else {
                  templateName = 'remainder_message';
                  messageToSend = customMessage;
                }
                fetch('https://graph.facebook.com/v16.0/100708719680927/messages', {
                  method: 'POST',
                  headers: {
                    'Authorization': 'Bearer EAARdq91aglsBAK36SeIGqtrNZBURrUZCv8jV7HxiP6BuzlwSoZCJQXugz6CG2YZCgUZBCp1d3RNZBq4rbBRVASDzDlZANZCIJ1PnPQpb3gntfLYGrNuDqGkBFsNneVZAsk6g4qjJ1BcJQOZCZBifqFQ0UNPy0QZAnZAsy8sZBTvnEZAMrNqI5up7f7tzyc9BuoYKZAd1AihnZCgmy2UWuK0qfvmlgFfIY',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: array_data[userIndex].number,
                    type: 'template',
                    template: {
                      name: templateName,
                      language: {
                        code: 'es_AR'
                      },
                      components: [
                        {
                          type: 'body',
                          parameters: [
                            {
                              type: 'text',
                              text: messageToSend
                            }
                          ]
                        }
                      ]
                    }
                  })
                })
                  .then(response => response.json())
                  .then(data => {
                    toast({
                      title: 'Enviado',
                      description: "Mensaje programado correctamente",
                      status: 'success',
                      duration: 4000,
                      isClosable: true
                    })
                  })
                  .catch(error => {
                    toast({
                      title: 'Error',
                      description: error.message,
                      status: 'error',
                      duration: 4000,
                      isClosable: true
                    })
                  });
              }
            }
          }
        }
      }
    })
  }

  return (
    <Grid
      templateRows='repeat(10, 1fr)'
      templateColumns='repeat(5, 1fr)'
      gap={4}
      h={'85vh'}
    >
      <GridItem rowSpan={10} colSpan={1} overflowY={"auto"}>
        <VStack mb={1}>
          <InputGroup>
            <Input pr={'4rem'} type="txt" onChange={filterUsers}>
            </Input>
            <InputRightElement width={'4rem'}>
              <IconButton aria-label={"search client"} icon={<FaSearch />} colorScheme="teal" variant={"outline"} h={'1.8rem'}>

              </IconButton>
            </InputRightElement>
          </InputGroup>
        </VStack>
        {filteredUsersFromDatabase.map((user, index) => {
          return (
            <VStack key={index} mb={1}>
              <Button w={'100%'} colorScheme="blue" onClick={() => selectUser(index)}>{user.name}</Button>
            </VStack>
          )
        })}
      </GridItem>
      <GridItem rowSpan={10} colSpan={2} overflowY={"auto"}>
        {selectedUser !== -1 && usersFromDatabase.length >= 1 &&
          <>
            <UserDataForm userData={newUserData} setUserData={setNewUserData} isNumberDisabled={true} key='currentUserData' />
            <Center>
              <HStack>
                <Button colorScheme="blue" onClick={() => props.updateUser(newUserData)}>
                  Actualizar
                </Button>
                <Button colorScheme="red" onClick={onDeleteAlertOpen}>
                  Eliminar
                </Button>
                <AlertDialog
                  isOpen={isDeleteAlertOpen}
                  leastDestructiveRef={cancelAlertRef}
                  onClose={onDeleteAlertClose}
                >
                  <AlertDialogOverlay>
                    <AlertDialogContent>
                      <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Eliminar cliente
                      </AlertDialogHeader>
                      <AlertDialogBody>
                        ¿Esta seguro que quiere eliminar a este cliente?
                      </AlertDialogBody>
                      <AlertDialogFooter>
                        <Button ref={cancelAlertRef} onClick={onDeleteAlertClose}>
                          Cancelar
                        </Button>
                        <Button colorScheme='red' onClick={() => deleteUser(userData.number as number)} ml={3}>
                          Eliminar
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
              </HStack>
            </Center>
          </>
        }
      </GridItem>
      <GridItem rowSpan={10} colSpan={2} overflowY={"auto"}>
        {selectedUser !== -1 && usersFromDatabase.length >= 1 &&
          <VStack>
            <Input
              placeholder="Select Date and Time"
              size="md"
              type="datetime-local"
              onChange={handleDateInputChange}
            />
            <Button colorScheme="cyan" w={'100%'} onClick={() => saveMessage('<Automatico>')}>Enviar mensaje automatico</Button>
            <Tag colorScheme="purple">Mensaje personalizado</Tag>
            <Input type="txt" onChange={(e) => { setCustomMessage(e.target.value) }}></Input>
            <Button colorScheme="cyan" w={'100%'} onClick={() => saveMessage(customMessage)}>
              Enviar mensaje personalizado
            </Button>
            {filteredUsersFromDatabase[selectedUser].messages && filteredUsersFromDatabase[selectedUser].messages.map((message, index) => {
              return (
                <Flex key={index} w={'100%'}>
                  <Tag w={'70%'} colorScheme="green" variant={"outline"}>{message.split('&&')[0]}</Tag>
                  <Tag w={'25%'} colorScheme="orange" variant={"outline"}>{message.split('&&')[1]}</Tag>
                  <Spacer />
                  <IconButton colorScheme="red" aria-label={"delete message"} icon={<FaTrash />} onClick={() => deleteMessage(index)}></IconButton>
                </Flex>
              )
            })}
            <Button onClick={() => testFunction()}>Test</Button>
          </VStack>
        }
      </GridItem>
    </Grid>
  )
}