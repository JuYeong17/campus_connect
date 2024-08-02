import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet,toString, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import moment from 'moment';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { getStoredUserInfo } from '../api';

const AnswerDetailScreen = ({ route, navigation }) => {
  const { addAnswer, post, answer, onUpdateAnswer, isEditing : initialEditing } = route.params;
  const [content, setContent] = useState(answer?.content || '');
  const [media, setMedia] = useState(answer?.image_url || null);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(initialEditing);
  

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getStoredUserInfo();
        if (user?.user) {
          setUserInfo(user.user);
        } else {
          console.warn('User info not found.');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (answer) {
      setIsEditing(true);
      setContent(answer.content || '');
      setMedia(answer.image_url || null);
    }
  }, [answer]);

  if (loading) {
    // Show loading state or spinner if needed
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!userInfo || !userInfo.nickname) {
    Alert.alert(
      "경고",
      `답변을 작성하려면 로그인하십시오.`,
      [ 
        {
          text: "확인", 
          onPress: () => navigation.goBack()
        }
      ],
      { cancelable: false }
    );
    return null;
  }

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
      setMedia(result.assets[0].uri);
    }
  };
  

  const handleSubmit = async () => {
    try {

      // Ensure the content and question_id are provided
    if (!content.trim()) {
      Alert.alert('Validation Error', 'Content cannot be empty.');
      return;
    }
    if (!post || !post.id) {
      Alert.alert('Validation Error', 'Post ID is required.');
      return;
    }
      const newAnswer = {
        content,
        image_url: media ? media : null,  // Ensure `image_url` can be null
        question_id: post.id,
        user_id: userInfo.id,
        answers_nickname: userInfo.nickname,
        like_count: 0,  // Initialize like_count to 0
        created_at: (isEditing ? answer.created_at : moment().toISOString()),  // Adjust date format
        is_selected: 0,  // Use 0 for false, assuming tinyint(1)
        selected_at: null,  // Set to null initially
      };

      let response;
      if (isEditing && answer) {
        response = await axios.put(`http://13.125.20.36:3000/api/answers/${answer.id}`, newAnswer);
        if (response.status === 200) {
          Alert.alert('성공', '답변이 수정되었습니다.');
          onUpdateAnswer(response.data);
        }
      } else {
        response = await axios.post('http://13.125.20.36:3000/api/answers', newAnswer);
        if (response.status === 201) {
          Alert.alert('성공', '답변이 추가되었습니다.');
          addAnswer(response.data);
        }
      }
      navigation.goBack();
    } catch (error) {
      console.log("fuck", response.data);
      console.error('Error submitting answer:', error.response || error.message);
      Alert.alert('오류', '답변 제출 중 오류가 발생했습니다.');
      
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{isEditing ? '답변 수정' : '답변 작성'}</Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="내용을 입력하세요..."
          value={content}
          onChangeText={setContent}
          multiline
        />
        <View style={styles.mediaContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.mediaButton}>
            <FontAwesome name="picture-o" size={24} color="gray" />
          </TouchableOpacity>          
        </View>
        {media && <Image source={{ uri: media }} style={styles.media} />}
        
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>{isEditing ? '수정 저장' : '저장'}</Text>
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
    marginBottom: 15,
  },
  mediaButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
  },
  mediaButtonText: {
    color: 'white',
  },
  media: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
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
    fontSize: 20,
  },
});

export default AnswerDetailScreen;
