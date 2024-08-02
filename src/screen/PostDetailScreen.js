import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Image, Keyboard } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Menu, Provider, Dialog, Portal, RadioButton } from 'react-native-paper';
import { Button as PaperButton } from 'react-native-paper';
import axios from 'axios';
import { getStoredUserInfo } from '../api';
import moment from 'moment';
import 'moment/locale/ko';

const formatRelativeTime = (time) => {
  const postTime = moment(time);
  return moment().diff(postTime, 'days') >= 1 ? postTime.format('YYYY-MM-DD') : postTime.fromNow();
};

const PostDetailScreen = () => {
  const route = useRoute();
  const { post: initialPost } = route.params; // post 데이터에서 질문 ID를 가져옵니다.
  const [post, setPost] = useState(initialPost);
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [scrapped, setScrapped] = useState(post.scrapped);
  const [menuVisible, setMenuVisible] = useState(false);
  const [answers, setAnswers] = useState([]); // 답변 목록을 위한 상태
  const [commenting, setCommenting] = useState(null);
  const navigation = useNavigation();
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null); // To track the selected answer

  moment.locale('ko');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getStoredUserInfo();
        if (response && response.user) {
          setUserInfo(response.user); // Assuming response.user contains the user info
        } else {
          console.warn('No user info found or response format is incorrect.');
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };
    fetchUserInfo();
    console.log('detail: ', userInfo);
  }, []);

  // useEffect(() => {
  //   // Fetch answers for the specific post
  //   const fetchAnswers = async () => {
  //     try {
  //       const response = await axios.get(`http://13.125.20.36:3000/api/answers/question/${post.id}`); // 특정 질문 ID에 맞는 답변을 가져옵니다.
  //       if (response.data) {
  //         setAnswers(response.data);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching answers:', error);
  //     }
  //   };

  //   fetchAnswers();
  // }, [post.id]);

  useEffect(() => {
    if (!post.id) return;
  
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://13.125.20.36:3000/api/questions/${post.id}`);
        console.log('Post data:', response.data);
        setPost(response.data);
      } catch (error) {
        if (error.response) {
          console.error('Response error:', error.response);
          Alert.alert('Error', `Server responded with status code ${error.response.status}`);
        } else if (error.request) {
          console.error('Request error:', error.request);
          Alert.alert('Error', 'No response received from server');
        } else {
          console.error('Error message:', error.message);
          Alert.alert('Error', 'An unexpected error occurred');
        }
      }
    };
  
    fetchPost();
  }, [post.id]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const response = await axios.get(`http://13.125.20.36:3000/api/answers/question/${post.id}`);
        if (response.data) {
          // Mark selected answer
          const updatedAnswers = response.data.map(answer => ({
            ...answer,
            selected: answer.is_selected === 1,
          }));
          setAnswers(updatedAnswers);
        }
      } catch (error) {
        console.error('Error fetching answers:', error);
      }
    };

    fetchAnswers();
  }, [post.id]);

  const handleSelectAnswer = async (answerId) => {
    try {
      // Mark the answer as selected
      const response = await axios.post(`http://13.125.20.36:3000/api/answers/select/${answerId}`, { userId: userInfo.id });
      if (response.data.success) {
        // Update the selected answer in the state
        setSelectedAnswerId(answerId);
        // Notify the user that the answer was selected
        Alert.alert('답변 채택', '이 답변이 채택되어 답변글 작성자에게 포인트가 지급되었습니다.');
        // Refresh the answers list to show the updated state
        const updatedAnswers = answers.map(answer =>
          answer.id === answerId ? { ...answer, selected: true } : { ...answer, selected: false }
        );
        setAnswers(updatedAnswers);
      }
    } catch (error) {
      console.error('Error selecting answer:', error);
      Alert.alert('Error', 'An error occurred while selecting the answer.');
    }
  };

  const toggleLike = () => {
    setLikes(likes + (liked ? -1 : 1));
    setLiked(!liked);
  };

  const toggleScrap = () => {
    setScrapped(!scrapped);
  };

  const addAnswer = (newAnswer) => {
    setAnswers((prevAnswers) => [newAnswer, ...prevAnswers]); // Add the new answer to the list
  };

  const addComment = (answerId, newComment) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.id === answerId ? { ...answer, comments: [newComment, ...(answer.comments || [])] } : answer
      )
    );
  };

  const toggleCommentLike = (answerId, commentId) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.id === answerId
          ? {
              ...answer,
              comments: answer.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      likes: comment.hasLiked ? comment.likes - 1 : comment.likes + 1,
                      hasLiked: !comment.hasLiked, // Toggle the like status
                    }
                  : comment
              ),
            }
          : answer
      )
    );
  };

  const navigateToAnswerDetail = () => {
    navigation.navigate('AnswerDetailScreen', { addAnswer, userInfo, post });
  };

  const handleCommentClick = (answerId) => {
    setCommenting(answerId);
    Keyboard.dismiss(); // Dismiss keyboard when starting to comment
  };

  const handleCloseCommentInput = () => {
    setCommenting(null);
  };

  const handleReportButtonClick = () => {
    setReportVisible(true);
    setMenuVisible(false);
  };

  const handleReportDismiss = () => {
    setReportVisible(false);
    setReportReason('');
  };

  const handleEditButtonClick = () => {
    setMenuVisible(false); // Close the menu
    handleEditConfirm();
    setEditVisible(true);
  };

  const handleDeleteButtonClick = () => {
    setMenuVisible(false); // Close the menu
    handleDeleteConfirm();
    setDeleteVisible(true);
  };

  const handleReportConfirm = () => {
    Alert.alert(
      '게시글 신고 접수',
      `해당 게시물이 ${reportReason} 사유로 신고 접수되었습니다.`,
      [
        {
          text: '확인',
          onPress: () => navigation.goBack(), // 나중에 신고 디비로 넘기기
        },
      ],
      { cancelable: false }
    );
    handleReportDismiss();
  };

  const handleEditConfirm = () => {
    setMenuVisible(false);
    navigation.navigate('WritePostScreen', {
      post,
      isEditing: true,
      category_id: post.category_id,
      onAddPost: (updatedPost) => {
        setPost(updatedPost); // Update local state with the updated post
      },
    });
  };

  const handleDeleteConfirm = async () => {
    Alert.alert(
      '게시글 삭제',
      '게시글을 정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            try {
              // Send DELETE request to the server
              const response = await axios.delete(`http://13.125.20.36:3000/api/questions/${post.id}`);
              
              if (response.status === 200) {
                Alert.alert('삭제 완료', '게시글이 성공적으로 삭제되었습니다.', [
                  {
                    text: '확인',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('삭제 실패', response.data.message);
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', '게시글을 삭제하는 동안 오류가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: false }
    );
    setDeleteVisible(false);
  };

  const renderComments = (comments, answerId) => (
    <View>
      {comments &&
        comments.map((comment, index) => (
          <View key={index} style={styles.commentContainer}>
            <View style={styles.commentUserTimeContainer}>
              <Ionicons name="person-circle" size={18} color="#2c3e50" />
              <Text style={styles.commentUsername}>{comment.username}</Text>
              <Text style={styles.commentTime}>{formatRelativeTime(comment.time)}</Text>
            </View>
            <Text style={styles.commentContent}>{comment.content}</Text>
            <View style={styles.commentActions}>
              <TouchableOpacity onPress={() => toggleCommentLike(answerId, comment.id)} style={styles.iconWithText}>
                <FontAwesome name={comment.hasLiked ? 'heart' : 'heart-o'} size={14} color="black" />
                <Text> {comment.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={14} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      {commenting === answerId && (
        <AddComment answerId={answerId} addComment={addComment} onClose={handleCloseCommentInput} />
      )}
    </View>
  );

  const sortedAnswers = [...answers].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Sort answers by creation time

  // Check if the current user is the author of the post
  const isAuthor = userInfo && userInfo.id === post.user_id;

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>취업게시판</Text>
            <Text style={styles.headerSubtitle}>{userInfo ? userInfo.univ_name : '로딩중...'}</Text>
          </View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
                <Ionicons name="ellipsis-vertical" size={30} color="white" />
              </TouchableOpacity>
            }
          >
            {isAuthor ? (
              <>
                <Menu.Item onPress={handleEditButtonClick} title="수정하기" />
                <Menu.Item onPress={handleDeleteButtonClick} title="삭제하기" />
              </>
            ) : (
              <Menu.Item onPress={handleReportButtonClick} title="신고하기" />
            )}
          </Menu>
        </View>
        <FlatList
          ListHeaderComponent={
            <View style={styles.postContainer}>
              <Text style={styles.title}>Q. {post.title}</Text>

              <Text style={styles.content}>{post.content}</Text>
              {post.image_url && (
          <Image
            source={{ uri: post.image_url }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
              <View style={styles.postUserTime}>
                <Ionicons name="person-circle" size={18} color="#2c3e50" />
                <Text style={styles.username}>{post.username}</Text>
                <Text style={styles.time}>{formatRelativeTime(post.created_at)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.interactions}>
                <TouchableOpacity onPress={toggleLike} style={styles.iconWithText}>
                  <FontAwesome name={liked ? 'heart' : 'heart-o'} size={14} color="black" />
                  <Text> 공감 {likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleScrap} style={styles.iconWithText}>
                  <FontAwesome name={scrapped ? 'bookmark' : 'bookmark-o'} size={14} color="black" />
                  <Text> 스크랩</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          data={sortedAnswers}
          renderItem={({ item }) => (
            <View style={styles.answerContainer}>
              <View style={styles.answerUserTimeContainer}>
                <Ionicons name="person-circle" size={18} color="#2c3e50" />
                <Text style={styles.answerUsername}>{item.answers_nickname}</Text>
                <Text style={styles.answerTime}>{formatRelativeTime(item.created_at)}</Text>
              </View>
              <Text style={styles.answerContent}>A. {item.content}</Text>
              {item.media && <Image source={{ uri: item.media }} style={styles.answerMedia} />}
              <View style={styles.answerFooter}>
                <TouchableOpacity onPress={() => handleCommentClick(item.id)} style={styles.commentButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="black" />
                  <Text style={styles.commentCount}>{item.comments ? item.comments.length : 0}</Text>
                </TouchableOpacity>
                {isAuthor && !item.selected && (
                  <TouchableOpacity onPress={() => handleSelectAnswer(item.id)} style={styles.iconWithText}>
                    <Text>채택</Text>
                  </TouchableOpacity>
                )}
                {item.selected && (
                  <Text style={styles.selectedText}>채택된 답변</Text>
                )}
              </View>
              {renderComments(item.comments, item.id)}
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
        {commenting === null && !isAuthor && (
          <TouchableOpacity style={styles.floatingButton} onPress={navigateToAnswerDetail}>
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        )}

        <Portal>
          <Dialog visible={reportVisible} onDismiss={handleReportDismiss}>
            <Dialog.Title>신고 사유 선택</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group onValueChange={(value) => setReportReason(value)} value={reportReason}>
                <View style={styles.radioContainer}>
                  <RadioButton.Item label="광고" value="광고" />
                  <RadioButton.Item label="스팸" value="스팸" />
                  <RadioButton.Item label="선정적임" value="선정적임" />
                  <RadioButton.Item label="장난스러움" value="장난스러움" />
                  <RadioButton.Item label="욕설" value="욕설" />
                  <RadioButton.Item label="비하" value="비하" />
                </View>
              </RadioButton.Group>
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={handleReportDismiss}>취소</PaperButton>
              <PaperButton onPress={handleReportConfirm}>확인</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        {/* <Portal>
          <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)}>
            <Dialog.Title>게시글 수정</Dialog.Title>
            <Dialog.Content>
              <Text>게시글이 수정되었습니다.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={() => setEditVisible(false)}>확인</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Portal>
          <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
            <Dialog.Title>게시글 삭제</Dialog.Title>
            <Dialog.Content>
              <Text>게시글이 삭제되었습니다.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={() => setDeleteVisible(false)}>확인</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal> */}
      </View>
    </Provider>
  );
};

const AddComment = ({ answerId, addComment, onClose }) => {
  const [comment, setComment] = useState('');

  const handleAddComment = () => {
    const newComment = {
      id: Math.random().toString(),
      content: comment,
      username: 'user2',
      likes: 0,
      hasLiked: false, // Track if the comment is liked
      time: new Date().toISOString(),
    };

    addComment(answerId, newComment);
    setComment('');
    onClose(); // Close the input box after adding comment
  };

  return (
    <View style={styles.addCommentContainer}>
      <TextInput
        style={styles.commentInput}
        value={comment}
        onChangeText={setComment}
        placeholder="댓글을 입력하세요"
      />
      <TouchableOpacity onPress={handleAddComment} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>작성</Text>
      </TouchableOpacity>
    </View>
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
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    position: 'absolute',
    left: 16,
    top: 45,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    left: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
  },
  menuButton: {
    marginLeft: 'auto',
  },
  postContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
  },
  postUserTime: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 10,
  },
  content: {
    fontSize: 16,
    marginVertical: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  time: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  interactions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  iconWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 4,
  },
  answerContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
  },
  answerUserTimeContainer: {
    flexDirection: 'row',
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  answerContent: {
    fontSize: 14,
    marginVertical: 8,
  },
  answerMedia: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  answerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  answerUsername: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 10,
  },
  answerTime: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  commentContainer: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  commentUserTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUsername: {
    color: '#7f8c8d',
    fontSize: 12,
    marginRight: 10,
  },
  commentContent: {
    fontSize: 12,
    marginVertical: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2c3e50',
    borderRadius: 50,
    padding: 10,
  },
  commentButton: {
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 7,
    paddingVertical: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
  },
  radioContainer: {
    flexDirection: 'column',
  },
  selectedText:{
    color: '#ccc',
  }
});

export default PostDetailScreen;
