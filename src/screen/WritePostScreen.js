import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import { addQuestion, updateQuestion, getStoredUserInfo } from '../api';

const WritePostScreen = ({ route }) => {
  const { post, isEditing, category_id, onAddPost } = route.params;
  const [title, setTitle] = useState(isEditing ? post.title : '');
  const [content, setContent] = useState(isEditing ? post.content : '');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [image, setImage] = useState(null); // State to store selected image
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getStoredUserInfo();
        setUserInfo(response.user || {}); // Set user info
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    fetchUserInfo();
  }, []);

  // Function to pick image
  const pickImage = async () => {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Allow user to pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // If the user did not cancel, set the image
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!userInfo) {
      setError('사용자 정보를 불러올 수 없습니다.');
      return;
    }
    const newPost = {
      title,
      content,
      category_id: category_id,
      user_id: userInfo.id,
      username: anonymous ? '익명' : userInfo.nickname,
      likes: 0,
      scrapped: false,
      created_at: moment().utc().format(),
      image_url: image, // Add the image URL to the post data
    };

    console.log('New Post Data:', newPost);

    try {
      if (isEditing) {
        await updateQuestion(post.id, newPost);
        onAddPost({ ...newPost, id: post.id, created_at: post.created_at }); // Update the existing post
      } else {
        const response = await addQuestion(newPost);
        onAddPost({ ...newPost, id: response.id, created_at: new Date().toISOString() });
      }
      navigation.goBack();
    } catch (err) {
      console.error('Error saving post', err.response?.data || err.message || err);
      setError('게시글 저장에 실패했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backIcon}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {isEditing ? '답변 수정' : '질문 작성'}
              </Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <TextInput
              style={styles.input}
              placeholder="제목을 입력하세요..."
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="내용을 입력하세요..."
              value={content}
              onChangeText={setContent}
              multiline
            />
            <View style={styles.mediaButton}>
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <FontAwesome name="picture-o" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}
            <View style={styles.switchContainer}>
              <Text>익명으로 게시</Text>
              <Switch value={anonymous} onValueChange={setAnonymous} />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity onPress={handleSave} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>
                {isEditing ? '수정' : '저장'}
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  imagePickerButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  imagePickerButtonText: {
    color: 'white',
    fontSize: 15,
  },
  mediaButton:{
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginVertical: 8,
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
