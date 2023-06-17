var express = require('express');
var router = express.Router();
let Article = require('../models/article');
let Comment = require('../models/comment');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.send('This is a protected route');
}

// to find the articles listing all in article.ejs
router.get('/', ensureAuthenticated, (req, res, next) => {
  Article.find({})
    .then((articles) => {
      // console.log(articles);
      res.render('articles', { articles: articles });
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// for adding new articles
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('addArticle');
});

// posting article in the articles.ejs page
router.post('/', ensureAuthenticated, (req, res, next) => {
  req.body.author = req.user.id;
  Article.create(req.body)
    .then((result) => {
      res.redirect('/articles');
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

router.get('/:id', ensureAuthenticated, (req, res, next) => {
  var id = req.params.id;
  Article.findById(id)
    .populate('author', 'name googleProfile.name')
    .populate('comments')
    .then((article) => {
      // console.log(article);
      if (!article || !article.author) {
        return res.status(404).render('404');
      }
      let authorName;
      if (article.author.name) {
        authorName = article.author.name;
      } else if (
        article.author.googleProfile &&
        article.author.googleProfile.name
      ) {
        authorName = article.author.googleProfile.name;
      }
      res.render('articleDetails', {
        article: article,
        authorName: authorName,
      });
    })
    .catch((err) => console.log(err));
});

// to edit we need to find the artcile
router.get('/:id/edit', ensureAuthenticated, (req, res, next) => {
  let id = req.params.id;
  var loggedInUserId = req.user.id;
  var articleId = req.params.id;
  Article.findById(articleId)
    .then((article) => {
      if (!article) {
        // if the Article is not found
        req.flash('error', 'Article not found');
        return res.redirect('back');
      }
      if (article.author.toString() !== loggedInUserId) {
        req.flash('error', 'Only the Author can Modify/Delete The Article');
        return res.redirect('back');
      }
      res.render('editArticleForm', { article: article });
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// to update the edited article
router.post('/:id', ensureAuthenticated, (req, res, next) => {
  let id = req.params.id;

  Article.findByIdAndUpdate(id, req.body)
    .then((article) => {
      if (!article.likes) {
        article.likes = 0;
      }
      res.redirect('/articles/' + id);
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// to delete the article
router.get('/:id/delete', ensureAuthenticated, (req, res, next) => {
  let articleId = req.params.id;
  let loggedInUserId = req.user.id;
  Article.findById(articleId)
    .then((article) => {
      if (!article) {
        req.flash('error', 'Article not found');
        return res.redirect('back');
      }
      if (article.author.toString() !== loggedInUserId) {
        req.flash('error', 'Only the article author can delete the article');
        return res.redirect('back');
      }

      Comment.deleteMany({ articleId: article.id })
        .then((article) => {
          Article.findByIdAndDelete(articleId)
            .then(() => {
              res.redirect('/articles');
            })
            .catch((error) => {
              if (error) return next(error);
            });
        })
        .catch((error) => {
          if (error) return next(error);
        });
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// for likes on the article
router.get('/:id/likes', ensureAuthenticated, (req, res, next) => {
  var id = req.params.id;

  Article.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true })
    .then((article) => {
      res.redirect('/articles/' + id);
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

// add comments
router.post('/:id/comments', ensureAuthenticated, (req, res, next) => {
  var id = req.params.id;
  req.body.articleId = id;
  req.body.commentorId = req.user.id;

  Article.findById(id)
    .then((article) => {
      if (!article) {
        req.flash('error', 'Article not found');
        return res.redirect('/articles');
      } else {
        req.body.article = article._id;

        Comment.create(req.body)
          .then((comment) => {
            // Update the article with the comment ID
            Article.findByIdAndUpdate(
              article._id,
              { $push: { comments: comment._id } },
              { new: true }
            )
              .then((updatedArticle) => {
                res.redirect('/articles/' + id);
              })
              .catch((error) => {
                if (error) return next(error);
              });
          })
          .catch((error) => {
            if (error) return next(error);
          });
      }
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

module.exports = router;
