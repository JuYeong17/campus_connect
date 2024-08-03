import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Keyboard,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Menu, Provider, Dialog, Portal, RadioButton } from 'react-native-paper';
import { Button as PaperButton } from 'react-native-paper';
import { getStoredUserInfo, toggleLike, toggleScrap, getQuestionStatus } from '../api';
import axios from 'axios'; // axios 임포트
import moment from 'moment';
import 'moment/locale/ko';

const formatRelativeTime = (time) => {
  const postTime = moment(time);
  return moment().diff(postTime, 'days') >= 1 ? postTime.format('YYYY-MM-DD') : postTime.fromNow();
};

const PostDetailScreen = () => {
  const route = useRoute();
  const { post: initialPost } = route.params;
  const [post, setPost] = useState(initialPost);
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false); // 초기 좋아요 상태 false로 설정
  const [scrapped, setScrapped] = useState(false); // 초기 스크랩 상태 false로 설정
  const [menuVisible, setMenuVisible] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [commenting, setCommenting] = useState(null);
  const navigation = useNavigation();
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [answerMenuVisible, setAnswerMenuVisible] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);

  moment.locale('ko');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getStoredUserInfo();
        if (response && response.user) {
          setUserInfo(response.user);
        } else {
          console.warn('사용자 정보가 없거나 잘못된 형식입니다.');
        }
      } catch (err) {
        console.error('사용자 정보 가져오기 오류:', err);
      }
    };

    fetchUserInfo();
  }, []);

  // 좋아요 및 스크랩 상태 가져오기
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!userInfo || !post.id) return; // 사용자 정보와 포스트 ID가 없는 경우 실행하지 않음

        const status = await getQuestionStatus(post.id, userInfo.id);
        setLiked(status.liked);
        setScrapped(status.scrapped);
      } catch (error) {
        console.error('좋아요 및 스크랩 상태 가져오기 오류:', error);
      }
    };

    fetchStatus();
  }, [userInfo, post.id]);

  useEffect(() => {
    if (!post.id) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://13.125.20.36:3000/api/questions/${post.id}`);
        setPost(response.data);
      } catch (error) {
        if (error.response) {
          console.error('응답 오류:', error.response);
          Alert.alert('오류', `서버가 상태 코드 ${error.response.status}로 응답했습니다.`);
        } else if (error.request) {
          console.error('요청 오류:', error.request);
          Alert.alert('오류', '서버로부터 응답이 없습니다.');
        } else {
          console.error('오류 메시지:', error.message);
          Alert.alert('오류', '예기치 못한 오류가 발생했습니다.');
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
          const updatedAnswers = response.data.map((answer) => ({
            ...answer,
            selected: answer.is_selected === 1,
          }));
          setAnswers(updatedAnswers);
        }
      } catch (error) {
        console.error('답변 가져오기 오류:', error);
      }
    };

    fetchAnswers();
  }, [post.id]);

  const handleSelectAnswer = async (answerId) => {
    try {
      console.log(`Selecting answer with ID: ${answerId}, user ID: ${userInfo.id}`); // 디버깅용 로그
  
      const response = await axios.post(`http://13.125.20.36:3000/api/answers/${answerId}/select`, {
        userId: userInfo.id,
      });
  
      if (response.data.success) {
        setSelectedAnswerId(answerId);
        Alert.alert('답변 채택', '이 답변이 채택되어 답변글 작성자에게 포인트가 지급되었습니다.');
        const updatedAnswers = answers.map((answer) =>
          answer.id === answerId ? { ...answer, selected: true } : { ...answer, selected: false }
        );
        setAnswers(updatedAnswers);
      }
    } catch (error) {
      console.error('답변 선택 오류:', error); // 에러 메시지 로그
      Alert.alert('오류', '답변 선택 중 오류가 발생했습니다.');
    }
  };
  
  // 좋아요 토글 핸들러
  const handleToggleLike = async () => {
    try {
      if (!userInfo) {
        Alert.alert('로그인 필요', '로그인 후 공감할 수 있습니다.');
        return;
      }

      const result = await toggleLike(post.id, userInfo.id, liked);
      if (result.success) {
        setLikes((prevLikes) => prevLikes + (result.liked ? 1 : -1)); // 좋아요 수 업데이트
        setLiked(result.liked);
        setPost({ ...post, likes: post.likes + (result.liked ? 1 : -1) });
      } else {
        Alert.alert('오류', result.message);
      }
    } catch (error) {
      console.error('좋아요 토글 오류:', error.message || error);
      Alert.alert('오류', error.message || '좋아요 토글 중 오류가 발생했습니다.');
    }
  };

  // 스크랩 토글 핸들러
  const handleToggleScrap = async () => {
    try {
      if (!userInfo) {
        Alert.alert('로그인 필요', '로그인 후 스크랩할 수 있습니다.');
        return;
      }

      const result = await toggleScrap(post.id, userInfo.id, scrapped);
      if (result.success) {
        setScrapped(result.scrapped);
        setPost({ ...post, scrapped: result.scrapped });
      } else {
        Alert.alert('오류', result.message);
      }
    } catch (error) {
      console.error('스크랩 토글 오류:', error.message || error);
      Alert.alert('오류', error.message || '스크랩 토글 중 오류가 발생했습니다.');
    }
  };

  const addAnswer = (newAnswer) => {
    setAnswers((prevAnswers) => [newAnswer, ...prevAnswers]);
  };

  const handleDeleteAnswer = (answerId) => {
    setAnswerMenuVisible(false);
    Alert.alert(
      '답변 삭제',
      '이 답변을 정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            try {
              await axios.delete(`http://13.125.20.36:3000/api/answers/${answerId}`);
              setAnswers((prevAnswers) => prevAnswers.filter((answer) => answer.id !== answerId));
              Alert.alert('삭제 완료', '답변이 삭제되었습니다.');
            } catch (error) {
              console.error('답변 삭제 오류:', error);
              Alert.alert('오류', '답변을 삭제하는 동안 오류가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleReportAnswer = (answerId) => {
    setAnswerMenuVisible(false);
    Alert.alert('답변 신고', '신고 기능은 아직 구현되지 않았습니다.');
  };

  const handleMenuPress = (answerId) => {
    setCurrentAnswer(answerId);
    setAnswerMenuVisible(true);
  };

  const handleMenuDismiss = () => {
    setAnswerMenuVisible(false);
    setCurrentAnswer(null);
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
                      hasLiked: !comment.hasLiked,
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
    Keyboard.dismiss();
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
    setMenuVisible(false);
    handleEditConfirm();
    setEditVisible(true);
  };

  const handleDeleteButtonClick = () => {
    setMenuVisible(false);
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
          onPress: () => navigation.goBack(),
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
        setPost(updatedPost);
      },
    });
  };

  const handleEditAnswer = (answerId) => {
    setAnswerMenuVisible(false);
    const answerToEdit = answers.find((answer) => answer.id === answerId);
    if (answerToEdit) {
      navigation.navigate('AnswerDetailScreen', {
        post,
        isEditing: true,
        answer: answerToEdit,
        onUpdateAnswer: (updatedAnswer) => {
          setAnswers((prevAnswers) =>
            prevAnswers.map((answer) => (answer.id === answerId ? updatedAnswer : answer))
          );
        },
      });
    } else {
      console.error('답변을 찾을 수 없습니다.');
    }
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
              console.error('게시글 삭제 오류:', error);
              Alert.alert('오류', '게시글을 삭제하는 동안 오류가 발생했습니다.');
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

  const sortedAnswers = [...answers].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const isAuthor = userInfo && userInfo.id === post.user_id;
  const isAnswerAuthor = (answer) => userInfo && userInfo.id === answer.user_id;

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
                <Image source={{ uri: post.image_url }} style={styles.postImage} resizeMode="cover" />
              )}
              <View style={styles.postUserTime}>
                <Ionicons name="person-circle" size={18} color="#2c3e50" />
                <Text style={styles.username}>{post.username}</Text>
                <Text style={styles.time}>{formatRelativeTime(post.created_at)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.interactions}>
                <TouchableOpacity onPress={handleToggleLike} style={styles.iconWithText}>
                  <FontAwesome name={liked ? 'heart' : 'heart-o'} size={14} color="black" />
                  <Text> 공감 {likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleToggleScrap} style={styles.iconWithText}>
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
                <View style={styles.userTimeContainer}>
                  <Ionicons name="person-circle" size={18} color="#2c3e50" />
                  <Text style={styles.answerUsername}>{item.answers_nickname}</Text>
                  <Text style={styles.answerTime}>{formatRelativeTime(item.created_at)}</Text>
                </View>
                <Menu
                  visible={answerMenuVisible && currentAnswer === item.id}
                  onDismiss={handleMenuDismiss}
                  anchor={
                    <TouchableOpacity onPress={() => handleMenuPress(item.id)} style={styles.moreButton}>
                      <Ionicons name="ellipsis-vertical" size={20} color="black" />
                    </TouchableOpacity>
                  }
                >
                  {isAnswerAuthor(item) ? (
                    <>
                      <Menu.Item onPress={() => handleEditAnswer(item.id)} title="수정하기" />
                      <Menu.Item onPress={() => handleDeleteAnswer(item.id)} title="삭제하기" />
                    </>
                  ) : (
                    <Menu.Item onPress={() => handleReportAnswer(item.id)} title="신고하기" />
                  )}
                </Menu>
              </View>
              <Text style={styles.answerContent}>A. {item.content}</Text>
              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.answerMedia} resizeMode="cover" />
              )}
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
                {item.selected && <Text style={styles.selectedText}>채택된 답변</Text>}
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
      hasLiked: false,
      time: new Date().toISOString(),
    };

    addComment(answerId, newComment);
    setComment('');
    onClose();
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
    justifyContent: 'space-between',
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
  userTimeContainer: {
    flexDirection: 'row',
  },
  moreButton: {
    marginLeft: 10,
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
  selectedText: {
    color: '#ccc',
  },
});

export default PostDetailScreen;
