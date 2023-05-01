import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Center, Flex, Grid, GridItem, HStack, IconButton, Input, InputGroup, InputLeftAddon, InputRightAddon, InputRightElement, Spacer, Tag, Textarea, VStack, useDisclosure, useToast, Text, Divider } from '@chakra-ui/react';
import UserDataForm from "./UserDataForm";
import { getDatabase, ref, onValue, remove, off, get, child } from "firebase/database";
import React from "react";
import { useEffect } from 'react';
import IUserDataForm from "./IUserDataForm";
import { FaSearch, FaTrash } from "react-icons/fa";

interface IProps {
  updateUser(userData: IUserDataForm): void
}

export default function UserLayout(props: IProps) {
  const [userData, setUserData] = React.useState<IUserDataForm>({ name: '', number: undefined, checkListOptions: [], messages: [] });
  const [newUserData, setNewUserData] = React.useState<IUserDataForm>({ name: '', number: undefined, checkListOptions: [], messages: [] });
  const [messageDate, setMessageDate] = React.useState('');
  const [customMessage, setCustomMessage] = React.useState('');
  const [usersFromDatabase, setUsersFromDatabase] = React.useState<IUserDataForm[]>([]);
  const [filteredUsersFromDatabase, setFilteredUsersFromDatabase] = React.useState<IUserDataForm[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<IUserDataForm>();
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
        if (selectedUser !== undefined) {
          const user = sorted_array_data.find((user) => user.number === selectedUser?.number);
          setSelectedUser(user)
          setUserData(user)
          setNewUserData(user);
        }
      }
    })
    return () => {
      off(databaseRef);
    }
  }, []);


  function selectUser(index: number) {
    setSelectedUser(undefined);
    setTimeout(() => {
      setSelectedUser(filteredUsersFromDatabase[index]);
      setUserData(filteredUsersFromDatabase[index]);
      if (!filteredUsersFromDatabase[index].messages) {
        setNewUserData({ ...filteredUsersFromDatabase[index], messages: [] });
      } else {
        setNewUserData({ ...filteredUsersFromDatabase[index] });
      }
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
  }

  function handleDateInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMessageDate(e.target.value);
  }

  function saveMessage(userData: IUserDataForm, message: string) {
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
    let messages = userData.messages;
    if (!messages) {
      messages = [];
    }
    messages.push(message + '&&' + messageDate);
    const updatedUserdata = { ...userData, messages };
    props.updateUser(updatedUserdata);
  }

  function deleteMessage(userData: IUserDataForm, index: number) {
    userData.messages.splice(index, 1);
    props.updateUser(userData);
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
        {selectedUser && usersFromDatabase.length >= 1 &&
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
        {selectedUser && usersFromDatabase.length >= 1 &&
          <VStack>
            <Input
              placeholder="Select Date and Time"
              size="md"
              type="datetime-local"
              onChange={handleDateInputChange}
            />
            <Button colorScheme="cyan" w={'100%'} onClick={() => saveMessage(newUserData, '<Automatico>')}>Enviar mensaje automatico</Button>
            <Divider />
            <Text>Buen dia</Text>
            <Textarea onChange={(e) => { setCustomMessage(e.target.value) }} />
            <Text>. Estamos en contacto</Text>
            <Button colorScheme="cyan" w={'100%'} onClick={() => saveMessage(newUserData, customMessage)}>
              Enviar mensaje personalizado
            </Button>
            {selectedUser.messages !== undefined && selectedUser.messages.map((message, index) => {
              return (
                <Flex key={index} w={'100%'}>
                  <Tag w={'70%'} colorScheme="green" variant={"outline"}>{message.split('&&')[0]}</Tag>
                  <Tag w={'25%'} colorScheme="orange" variant={"outline"}>{message.split('&&')[1]}</Tag>
                  <Spacer />
                  <IconButton colorScheme="red" aria-label={"delete message"} icon={<FaTrash />} onClick={() => deleteMessage(newUserData, index)}></IconButton>
                </Flex>
              )
            })}
          </VStack>
        }
      </GridItem>
    </Grid>
  )
}