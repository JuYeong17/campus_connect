import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Image, Keyboard } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Menu, Provider, Dialog, Portal, RadioButton } from 'react-native-paper';
import { Button as PaperButton } from 'react-native-paper'
import moment from 'moment';
import 'moment/locale/ko'; 

const formatRelativeTime = (time) => {
  const postTime = moment(time);
  return moment().diff(postTime, 'days') >= 1 ? postTime.format('YYYY-MM-DD') : postTime.fromNow();
};

const PostDetailScreen = () => {
  const route = useRoute();
  const { post, userInfo } = route.params;
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [scrapped, setScrapped] = useState(post.scrapped);
  const [menuVisible, setMenuVisible] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [commenting, setCommenting] = useState(null);
  const navigation = useNavigation();
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  moment.locale('ko');

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
    navigation.navigate('AnswerDetailScreen', { addAnswer, userInfo });
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
    // Handle the edit action here
    setEditVisible(true);
  };

  const handleDeleteButtonClick = () => {
    setMenuVisible(false); // Close the menu
    // Handle the delete action here
    setDeleteVisible(true);
  };

  const handleReportConfirm = () => {
    Alert.alert(
      "게시글 신고 접수",
      `해당 게시물이 ${reportReason} 사유로 신고 접수되었습니다.`,
      [ 
        {
          text: "확인", 
          onPress: () => console.log("Report confirmed") // 나중에 신고 디비로 넘기기
        }
      ],
      { cancelable: false }
    );
    handleReportDismiss();
  };

  const handleEditConfirm = () => {
    Alert.alert(
      "게시글 수정",
      "게시글 수정 기능은 현재 준비 중입니다.",
      [ 
        { text: "확인", onPress: () => console.log("Edit Confirmed") }
      ],
      { cancelable: false }
    );
    setEditVisible(false);
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      "게시글 삭제",
      "게시글 삭제 기능은 현재 준비 중입니다.",
      [ 
        { text: "확인", onPress: () => console.log("Delete Confirmed") }
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

  const sortedAnswers = [...answers].sort((a, b) => new Date(a.time) - new Date(b.time)); // Sort answers by creation time


  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>취업게시판</Text>
            <Text style={styles.headerSubtitle}>{userInfo.selectedUniversity}</Text>
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
            <Menu.Item onPress={handleEditButtonClick} title="수정하기" />
            <Menu.Item onPress={handleDeleteButtonClick} title="삭제하기" />
            <Menu.Item onPress={handleReportButtonClick} title="신고하기" />
          </Menu>
        </View>
        <FlatList
          ListHeaderComponent={
            <View style={styles.postContainer}>              
              <Text style={styles.title}>Q. {post.title}</Text>
              
              <Text style={styles.content}>{post.content}</Text> 
              <View style={styles.postUserTime}>
                <Ionicons name="person-circle" size={18} color="#2c3e50" />
                <Text style={styles.username}>{post.username}</Text>
                <Text style={styles.time}>{formatRelativeTime(post.time)}</Text>
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
                <Text style={styles.answerUsername}>{item.username}</Text>
                <Text style={styles.answerTime}>{formatRelativeTime(item.time)}</Text>
              </View>
              <Text style={styles.answerContent}>A. {item.content}</Text>
              {item.media && <Image source={{ uri: item.media }} style={styles.answerMedia} />}
              <View style={styles.answerFooter}>
                <TouchableOpacity onPress={() => handleCommentClick(item.id)} style={styles.commentButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="black" />
                  <Text style={styles.commentCount}>{item.comments ? item.comments.length : 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectAnswer(item.id)} style={styles.iconWithText}>
                  <Text>채택</Text>
                </TouchableOpacity>
              </View>
              {renderComments(item.comments, item.id)}
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
        {commenting === null && (
          <TouchableOpacity style={styles.floatingButton} onPress={navigateToAnswerDetail}>
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        )}

        <Portal>
          <Dialog visible={reportVisible} onDismiss={handleReportDismiss}>
            <Dialog.Title>신고 사유 선택</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group onValueChange={value => setReportReason(value)} value={reportReason}>
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
        <Portal>
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
    marginBottom : 5,
  },
  username: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight : 10,
  },
  content: {
    fontSize: 16,
    marginVertical: 8,
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
  answerUserTimeContainer:{
    flexDirection : 'row',
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
    justifyContent : 'flex-start',
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
  commentUserTimeContainer:{
    flexDirection : 'row',
    alignItems : 'center'
  },
  commentUsername: {
    color: '#7f8c8d',
    fontSize : 12,
    marginRight : 10,
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
    flexDirection : 'row',
    alignItems : 'center',    
  },
  commentCount: {
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor : '#2c3e50',
    paddingHorizontal: 7,
    paddingVertical: 10,
    borderRadius : 5,
  },
  submitButtonText: {
    color : 'white',
  },
  radioContainer: {
    flexDirection: 'column',
  },
});

export default PostDetailScreen;