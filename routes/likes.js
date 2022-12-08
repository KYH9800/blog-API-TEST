const express = require('express');
const { Likes, Posts, sequelize, Sequelize } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/like')
  // 좋아요 게시글 조회
  .get(authMiddleware, async (req, res) => {
    try {
      const { userId } = res.locals.user;

      let userLikes = await Likes.findAll({
        where: { userId },
      });

      const postsQuery = `
                SELECT p.postId, u.userId, u.nickname, p.title, p.createdAt, p.updatedAt
                FROM Posts AS p
                JOIN Users AS u
                ON p.userId = u.userId
                ORDER BY p.postId DESC`;

      const getLikePostIdByLikes = (likes) => {
        let likePostIdArray = [];
        for (const like of likes) {
          likePostIdArray.push(like.postId);
        }

        return likePostIdArray;
      };

      // getLikePostIdByLikes 함수 작업을 먼저하고 likePostIdArray 선언해서 값을 할당한다.
      let likePostIdArray = getLikePostIdByLikes(userLikes);

      // 위의 작업을 끝내고 query 작업을 통해 뽑아낸 데이터들을 posts에 담는다.
      let posts = await sequelize
        .query(postsQuery, {
          type: Sequelize.QueryTypes.SELECT,
        })
        .then((posts) => getPostsByPostIdArray(likePostIdArray, posts));

      // 좋아요 눌린 게시글들 불러오고
      const likes = await Likes.findAll();
      console.log('likes: ', likes);

      // post를 얕은 복사해와서 like.postId === post.postId의 길이 만큼 거른다.
      posts = posts.map((post) => {
        return {
          ...post,
          likes: likes.filter((like) => like.postId === post.postId).length,
        };
      });

      // 가져온 값들을 최신 생성날짜 내림차순으로 그리고 좋아요가 많은 순서대로 내림차순으로 나열한다.
      posts.sort((a, b) => b.createdAt - a.createdAt);
      posts.sort((a, b) => b.likes - a.likes);

      return res.status(200).json({
        data: posts,
      });
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      return res.status(400).json({
        errorMessage: '좋아요 게시글 조회에 실패하였습니다.',
      });
    }
  });

router
  .route('/:postId/like')
  // 좋아요 업데이트
  .put(authMiddleware, async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = res.locals.user;

      const isExist = await Posts.findByPk(postId);

      if (!isExist) {
        return res.status(404).json({
          errorMessage: '게시글이 존재하지 않습니다.',
        });
      }

      let isLike = await Likes.findOne({
        where: { postId, userId },
      });

      if (!isLike) {
        await Likes.create({ postId, userId });

        return res
          .status(200)
          .json({ message: '게시글의 좋아요를 등록하였습니다.' });
      } else {
        await Likes.destroy({
          where: { postId, userId },
        });

        return res
          .status(200)
          .json({ message: '게시글의 좋아요를 취소하였습니다.' });
      }
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      return res.status(400).json({
        errorMessage: '게시글 좋아요에 실패하였습니다.',
      });
    }
  });

function getPostsByPostIdArray(postIdArray, posts) {
  return posts.filter((post) => {
    return postIdArray.includes(post.postId);
  });
}

module.exports = router;
