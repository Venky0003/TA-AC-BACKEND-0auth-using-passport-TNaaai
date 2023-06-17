var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');
var Article = require('../models/article');
var flash = require('connect-flash');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

router.get('/:id/edit', ensureAuthenticated, (req, res, next) => {
  // var id = req.params.id;
  var loggedInUserId = req.user.id;
  var commentId = req.params.id;
  Comment.findById(commentId)
    .then((comment) => {
      if (!comment) {
        req.flash('error', 'Comment not found');
        return res.redirect('back');
      }
      if (comment.commentorId.toString() !== loggedInUserId){
        // if (comment.author.equals(req.user._id)) {
          req.flash('error', 'Only the comment author can edit/delete the comment');
          return res.redirect('back');
        } 
        res.render('UpdateComment', { comment: comment });
    })
    .catch((err) => {
      console.error(error);
        req.flash('error', 'Server Error');
        res.redirect('back');
    });
});

router.post('/:id', ensureAuthenticated, (req, res, next) => {
  var id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body)
    .then((comments) => {
      res.redirect('/articles/' + comments.articleId);
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

// for delting the comments
router.get('/:id/delete', ensureAuthenticated, (req, res, next) => {
 
  var loggedInUserId = req.user.id;
  var commentId = req.params.id;
  Comment.findById(commentId)
    .then((comment) => {
      if (!comment) {
        req.flash('error', 'Comment not found');
        return res.redirect('back');
      }
      if (comment.commentorId.toString() !== loggedInUserId) {
        req.flash('error', 'Only the comment author can delete the comment');
        return res.redirect('back');
      }
      // Comment author matches, delete the comment
      Comment.findByIdAndRemove(commentId)
        .then(() => {
          req.flash('success', 'Comment deleted successfully');
          res.redirect('back');
        })
        .catch((err) => {
          console.error(err);
          req.flash('error', 'Server Error');
          res.redirect('back');
        });
    })
    .catch((err) => {
      console.error(err);
      req.flash('error', 'Server Error');
      res.redirect('back');
    });
 
});

// for likes on the comment
router.get('/:id/likes', ensureAuthenticated, (req, res, next) => {
  let commentId = req.params.id;
  Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } })
    .populate('article')
    .then((comment) => {
      res.redirect('/articles/' + comment.articleId);
    });
});

// for dislikes on the comment
router.get('/:id/dislikes', ensureAuthenticated, (req, res, next) => {
  let commentId = req.params.id;

  Comment.findByIdAndUpdate(commentId, { $inc: { dislikes: -1 } })
    .then((comment) => {
      res.redirect('/articles/' + comment.articleId);
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

module.exports = router;
