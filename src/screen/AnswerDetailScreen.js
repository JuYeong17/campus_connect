import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { getStoredUserInfo } from '../api';

const AnswerDetailScreen = ({ route, navigation }) => {
  const { addAnswer, post } = route.params;
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = async () => {
    try {
      const user = await getStoredUserInfo();
      if (user && user.user) {
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

  useEffect(() => {
    fetchUserInfo();
  }, []);

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

  const handleSubmit = async () => {
    try {
      const newAnswer = {
        content,
        image_url: media ? media : null,  // Ensure `image_url` can be null
        question_id: post.id,
        user_id: userInfo.id,
        answers_nickname: userInfo.nickname,
        like_count: 0,  // Initialize like_count to 0
        created_at: moment().toISOString(),  // Adjust date format
        is_selected: 0,  // Use 0 for false, assuming tinyint(1)
        selected_at: null,  // Set to null initially
      };

      const response = await axios.post('http://13.125.20.36:3000/api/answers', newAnswer);
      if (response.status === 201) {
        Alert.alert('성공', '답변이 추가되었습니다.');
        addAnswer(response.data); // 새로운 답변을 PostDetailScreen에 전달
        navigation.goBack(); // PostDetailScreen으로 돌아가기
      }
    } catch (error) {
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
    marginBottom: 15,
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
  submitButton: {
    padding: 8,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 30,
  },
});

export default AnswerDetailScreen;
