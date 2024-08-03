import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment';
import { getStoredUserInfo } from '../api'; // Assuming you have this function to get user info

const formatRelativeTime = (time) => {
  const postTime = moment(time);
  return moment().diff(postTime, 'days') >= 1 ? postTime.format('YYYY-MM-DD') : postTime.fromNow();
};

const CommentManagementScreen = () => {
  const [comments, setComments] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUserInfo = await getStoredUserInfo(); // Fetch stored user info
        if (storedUserInfo && storedUserInfo.user) {
          setUserInfo(storedUserInfo.user); // Set user info
          fetchComments(storedUserInfo.user.id); // Fetch comments for this user
        } else {
          Alert.alert('오류', '로그인 정보가 없습니다.');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        Alert.alert('오류', '사용자 정보를 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchUserInfo();
  }, []);

  const fetchComments = async (userId) => {
    try {
      const response = await axios.get(`http://13.125.20.36:3000/api/answers/user/${userId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('오류', '댓글을 가져오는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert('댓글 삭제', '정말로 이 댓글을 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: async () => {
          try {
            await axios.delete(`http://13.125.20.36:3000/api/answers/${commentId}`);
            setComments(comments.filter((comment) => comment.id !== commentId));
            Alert.alert('삭제 완료', '댓글이 삭제되었습니다.');
          } catch (error) {
            console.error('Error deleting comment:', error);
            Alert.alert('오류', '댓글 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const toggleLike = (id) => {
    const updatedComments = comments.map((comment) =>
      comment.id === id
        ? { ...comment, likes: comment.likes + (comment.hasLiked ? -1 : 1), hasLiked: !comment.hasLiked }
        : comment
    );
    setComments(updatedComments);
  };

  const renderItem = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Ionicons name="person-circle" size={18} color="#2c3e50" />
        <Text style={styles.commentUsername}>{item.answers_nickname}</Text>
        <Text style={styles.commentTime}>{formatRelativeTime(item.created_at)}</Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentQuestion}>질문: {item.question_title}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.iconWithText}>
          <FontAwesome name={item.hasLiked ? 'heart' : 'heart-o'} size={14} color="black" />
          <Text>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
          <Ionicons name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>댓글 관리</Text>
        </View>
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    position: 'absolute',
    left: 16,
    top: 45,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  commentContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUsername: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 10,
  },
  commentTime: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  commentContent: {
    fontSize: 14,
    marginVertical: 4,
  },
  commentQuestion: {
    fontSize: 12,
    color: '#bdc3c7',
    marginBottom: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  iconWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
});

export default CommentManagementScreen;
