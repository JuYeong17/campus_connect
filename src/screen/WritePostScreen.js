import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet, TouchableOpacity, Switch, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { addQuestion, updateQuestion } from '../api';

const WritePostScreen = ({ route }) => {
  const { userInfo, post, isEditing } = route.params;
  const [title, setTitle] = useState(isEditing ? post.title : '');
  const [content, setContent] = useState(isEditing ? post.content : '');
  // const [media, setMedia] = useState(isEditing ? post.media : null);
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const navigation = useNavigation();

  // const pickMedia = async () => {
  //   if (!status?.granted) {
  //     const permission = await requestPermission();
  //     if (!permission.granted) {
  //       alert('사진 접근 권한이 필요합니다!');
  //       return null;
  //     }
  //   }
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     allowsEditing: false,
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setMedia(result.uri);
  //   }
  // };

  const handleSave = async () => {
    const newPost = {
      title,
      content,
      category_id: 1, // Set a default category id or let the user select one
      user_id: userInfo.user_id,
      username: anonymous ? '익명' : userInfo.nickname,
      likes: 0,
      scrapped: false,
      liked: false,       
    };

    console.log(newPost);

    try {
      if (isEditing) {
        await updateQuestion(post.user_id, newPost);
      } else {
        await addQuestion(newPost);
      }
      navigation.goBack();
    } catch (err) {
      console.error('Error saving post', err);
      setError('게시글 저장에 실패했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{isEditing ? '답변 수정' : '질문 작성'}</Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
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
            {/* <View style={styles.mediaContainer}>
              <TouchableOpacity onPress={pickMedia} style={styles.mediaButton}>
                <Text style={styles.mediaButtonText}>미디어 추가</Text>
              </TouchableOpacity>
              {media && <Image source={{ uri: media }} style={styles.media} />}
            </View> */}
            <View style={styles.switchContainer}>
              <Text>익명으로 게시</Text>
              <Switch value={anonymous} onValueChange={setAnonymous} />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity onPress={handleSave} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>{isEditing ? '수정' : '저장'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    width: '100%',
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
    padding: 16,
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
  submitButton: {
    padding: 8,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    marginVertical: 8,
  },
});

export default WritePostScreen;
