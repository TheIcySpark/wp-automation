import * as React from "react"
import {
  ChakraProvider,
  Grid,
  theme,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Center,
  Container,
  useToast,
  Spacer,
} from "@chakra-ui/react"
import UserDataForm from "./components/UserDataForm"
import UserLayout from "./components/UserLayout"
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import IUserDataForm from "./components/IUserDataForm"
import Login from "./components/Login";
import { getAuth, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCYqQAi2gtSrpt18atJd9nzedDWF88E_cg",
  authDomain: "wp-automation-870c7.firebaseapp.com",
  projectId: "wp-automation-870c7",
  storageBucket: "wp-automation-870c7.appspot.com",
  messagingSenderId: "288453762895",
  appId: "1:288453762895:web:2d8e90a4e199b6bd6c2f3a",
  measurementId: "G-DHQ2RPW031",
  databaseURL: "https://wp-automation-870c7-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const checkListDescriptions = [
  'DNI', 'Licencia de conducir', 'Cedula verde', 'Fotos de nuestro vehiculo',
  'Certificado de cobertura', 'Denuncia de siniestro', 'Relato de los hechos',
  'declaracion de no seguro', 'Presupuesto', 'Documentacion medica', 'Estudios medicos',
  'Historia clinica', 'Doc. del requerido', 'Fotos del hecho'
]

export default function App() {
  const [userData, setUserData] = React.useState<IUserDataForm>({
    name: '', number: undefined, 
    checkListOptions: new Array(14).fill({name: '', value: 'negativo'}).map((item, index) => ({name: checkListDescriptions[index], value: 'negativo'})), 
    messages: [] });
  const [authUser, setAuthUser] = React.useState();
  const toast = useToast()

  function saveUser(userData: IUserDataForm) {
    set(ref(database, 'users/' + userData.number), {
      name: userData.name,
      number: userData.number,
      checkListOptions: userData.checkListOptions,
      messages: userData.messages
    })
      .then(() => {
        toast({
          title: 'Guardado',
          description: "Informacion del cliente guardada",
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
      })
  }

  function closeSession(){
    setAuthUser(undefined)
    const auth = getAuth()
    signOut(auth)
    .then(() =>{
      toast({
        title: 'Sesion cerrada',
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
    })
  }

  return (
    <ChakraProvider theme={theme}>
      <Grid minH="100vh" p={3}>
        {!authUser && <Login setAuthUser={setAuthUser} />}
        {authUser &&
          <Tabs variant={'enclosed'} colorScheme="green">
            <TabList>
              <Tab>Crear nuevo usuario</Tab>
              <Tab>Usuarios</Tab>
              <Spacer />
              <Button colorScheme="red" onClick={closeSession} variant={"ghost"}>Cerrar sesion</Button>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Container maxW='container.sm'>
                  <UserDataForm setUserData={setUserData} userData={userData}></UserDataForm>
                </Container>
                <Center>
                  <Button colorScheme="cyan" onClick={() => saveUser(userData)}>Crear usuario</Button>
                </Center>
              </TabPanel>
              <TabPanel>
                <UserLayout updateUser={saveUser}></UserLayout>
              </TabPanel>
            </TabPanels>
          </Tabs>
        }
      </Grid>
    </ChakraProvider>
  )
}
/* <ColorModeSwitcher justifySelf="flex-end" /> */
