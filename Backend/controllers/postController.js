const Post = require('../models/Post');

// Farmer/homestay accounts can upload unlimited photo/video posts —
// each upload just becomes a new Post document.
exports.createPost = async (req, res) => {
  try {
    const { content, type, caption, location } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const post = await Post.create({
      author: req.user.id,
      authorRole: req.user.role,
      type: type || (mediaUrl ? 'image' : 'text'),
      content,
      caption,
      location,
      mediaUrl,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Could not create post', error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch posts' });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch post' });
  }
};

exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch posts' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }
    Object.assign(post, req.body);
    await post.save();
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete post' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ success: true, likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Could not like post' });
  }
};