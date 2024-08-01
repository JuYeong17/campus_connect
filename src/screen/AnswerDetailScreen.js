import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const AnswerDetailScreen = ({ route, navigation }) => {
  const { addAnswer, userInfo } = route.params;
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  if (!userInfo || !userInfo.nickname) {
    alert('User information is missing.');
    return null;
  }



  const pickImage = async () => {
    if (!status?.granted) {
      const permission = await requestPermission();
      if (!permission.granted) {
        alert('사진 접근 권한이 필요합니다!');
        return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.uri);
    }
  };

  const handleSubmit = () => {
    const newAnswer = {
      id: String(new Date().getTime()),
      content,
      image_url: media,
      answers_nickname: userInfo.nickname,
      user_id: userInfo.user_id,
      time : moment().toISOString(),
  
    };
    addAnswer(newAnswer);
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>답변 작성</Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="내용"
          value={content}
          onChangeText={setContent}
          multiline
        />
        <View style={styles.mediaContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.mediaButton}>
            <Text style={styles.mediaButtonText}>미디어 추가</Text>
          </TouchableOpacity>
          {media && <Image source={{ uri: media }} style={styles.media} />}
        </View>
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.mediaButtonText}>제출</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    position: 'absolute',
    left: 16,
    top: 40,
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginVertical: 8,
    borderRadius: 8,
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginBottom : 15,
  },
  mediaButton: {
    padding: 8,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    marginRight: 8,
  },
  mediaButtonText: {
    color: 'white',
  },
  media: {
    width: 100,
    height: 100,
  },
  submitButton : {
    padding: 8,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    marginRight: 8,
    alignItems : 'center'
  },
  submitButtonText: {
    color: 'white',
    fontSize : 30,
  },
});

export default AnswerDetailScreen;
