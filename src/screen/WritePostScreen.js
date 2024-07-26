import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

const WritePostScreen = ({ route }) => {
  const { addPost, userInfo, post, isEditing } = route.params;
  const [title, setTitle] = useState(isEditing ? post.content : '');
  const [content, setContent] = useState(isEditing ? post.content : '');
  const [media, setMedia] = useState(isEditing ? post.content : null);
  const [anonymous, setAnonymous] = useState(false);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const navigation = useNavigation();

  const pickMedia = async () => {

    if (!status?.granted) {
      const permission = await requestPermission();
      if(!permission.granted)
        alert('사진 접근 권한이 필요합니다!');
        return null;
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

  const handleSave = () => {
    const newPost = {
      id: isEditing ? post.id : String(new Date().getTime()),
      title,
      content,
      time: new Date().toISOString(),
      comments: 0,
      likes: 0,
      scrapped: false,
      liked: false,
      media,
      username: anonymous ? '익명' : userInfo.nickname,
    };
    if(isEditing){
      updatePost(newPost)
    } else{
      addPost(newPost);
    }
    
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{isEditing ? '답변 수정' : '질문 작성'}</Text>
        </View>
      </View>
      <View style={ styles.contentContainer}>
      <TextInput
        style={styles.input}
        placeholder="제목"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.contentInput]}
        placeholder="내용"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <View style={styles.mediaContainer}>
        <TouchableOpacity onPress={pickMedia} style={styles.mediaButton}>
          <Text style={styles.mediaButtonText}>미디어 추가</Text>
        </TouchableOpacity>
        {media && <Image source={{ uri: media }} style={styles.media} />}
      </View>
      <View style={styles.switchContainer}>
        <Text>익명으로 게시</Text>
        <Switch value={anonymous} onValueChange={setAnonymous} />
      </View>
      <TouchableOpacity onPress={handleSave} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>{isEditing ? '수정' : '저장'}</Text>
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
    backgroundColor: '#ffffff',
    padding : 16
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
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
    fontSize : 15,
  },
});

export default WritePostScreen;