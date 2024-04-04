import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from './colors';
import { useEffect, useState } from 'react';
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = "@toDos";

export default function App() {
  
  //상단의 Work와 Travel에 눌림의 따라 useState값 변경하여 현재 눌린 버튼 알려주기
  const [working, setWorking] = useState(true);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);

  //사용자가 작성한 text를 저장 -> 나중에 백서버 만들어서 디비에 저장해서 보여줄 때 가져오기
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const onChangeText = (payload) => setText(payload);
  //작성한 toDo를 앱을 꺼도 저장할 수 있게 Storage를 통해 저장한다
  const saveTodo = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }
  const loadToDos = async () => {
    const s = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY));
    setToDos(s);
  }

  useEffect(() => {
    loadToDos();
  }, [])

  const addToDo = async () => {
    if(text === "") return; //아무것도 입력하지 않으면 바로 취소
    // save to do
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working },
    };
    setToDos(newToDos);
    setText(""); // 입력 후 textInput 초기화
    await saveTodo(newToDos);
  }

  //삭제
  const deleteToDo = (key) => {
    Alert.alert(
      "Delete To Do?",
      "Are you sure?",
      [
        {text : "Cancel"},
        { text : "Ok",
          style : "destructive", 
          onPress : async () => {
          const newToDos = {...toDos};
          delete newToDos[key];
          setToDos(newToDos);
          await saveTodo(newToDos);
        } },
      ],

    );
    return;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? theme.white : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? theme.white : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        returnKeyType='done'
        style={styles.input} 
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) => (
          toDos[key].working === working ? 
          (
            <View style={styles.toDo} key={key}> 
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color="grey" />
              </TouchableOpacity>
            </View>
          ) : null
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent:"space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "conter",
    justifyContent: "space-between"
  },
  toDoText: {
    color:"white",
    fontSize: 16,
    fontWeight: "500",
  }
});
