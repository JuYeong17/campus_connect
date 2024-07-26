import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Provider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';

const formatRelativeTime = (time) => {
  const postTime = moment(time);
  return moment().diff(postTime, 'days') >= 1 ? postTime.format('YYYY-MM-DD') : postTime.fromNow();
};

const CommentManagementScreen = () => {
  const [comments, setComments] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
//   const { userInfo } = route.params;

  useEffect(() => {
    // Fetch the comments from an API or database
    const initialComments = [
      { id: '1', content: '이것은 댓글 1입니다.', username: 'user1', time: '2024-07-22T10:00:00Z', likes: 5, hasLiked: false },
      { id: '2', content: '이것은 댓글 2입니다.', username: 'user2', time: '2024-07-22T11:00:00Z', likes: 3, hasLiked: false },
      { id: '3', content: '이것은 댓글 3입니다.', username: 'user3', time: '2024-07-22T12:00:00Z', likes: 1, hasLiked: false },
    ];
    setComments(initialComments);
  }, []);

  const handleDeleteComment = (commentId) => {
    Alert.alert('댓글 삭제', '정말로 이 댓글을 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => {
          setComments(comments.filter(comment => comment.id !== commentId));
        },
      },
    ]);
  };

  const toggleLike = (id) => {
    const updatedComments = comments.map(comment =>
      comment.id === id ? { ...comment, likes: comment.likes + (comment.hasLiked ? -1 : 1), hasLiked: !comment.hasLiked } : comment
    );
    setComments(updatedComments);
  };

  const renderItem = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Ionicons name="person-circle" size={18} color="#2c3e50" />
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentTime}>{formatRelativeTime(item.time)}</Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
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
          keyExtractor={item => item.id}
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
    zIndex : 1,
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
