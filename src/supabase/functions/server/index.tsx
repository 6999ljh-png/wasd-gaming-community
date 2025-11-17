import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to calculate user level
function calculateLevel(experience: number): number {
  return Math.floor(Math.sqrt(experience / 100));
}

// Helper function to calculate leaderboard score
function calculateScore(posts: number, likes: number, comments: number, hotness: number = 0): number {
  return (posts * 10) + (likes * 5) + (comments * 3) + hotness;
}

// User signup
app.post('/make-server-b33c7dce/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since we don't have email server configured
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Create user profile in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio: '',
      level: 1,
      score: 0,
      posts: 0,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Password reset request
app.post('/make-server-b33c7dce/auth/reset-password', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${c.req.header('origin') || 'http://localhost:3000'}/reset-password`,
    });
    
    if (error) {
      console.log('Password reset error:', error);
      // Don't reveal if email exists or not for security
      return c.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link.' });
    }
    
    return c.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link.' });
  } catch (error) {
    console.log('Password reset error:', error);
    return c.json({ error: 'Internal server error during password reset' }, 500);
  }
});

// Update password (after reset)
app.post('/make-server-b33c7dce/auth/update-password', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { newPassword } = await c.req.json();
    
    if (!newPassword || newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    // Update password
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    
    if (error) {
      console.log('Update password error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.log('Update password error:', error);
    return c.json({ error: 'Internal server error during password update' }, 500);
  }
});

// Get current user data
app.get('/make-server-b33c7dce/auth/user', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    return c.json({ user: userData });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'Internal server error while fetching user' }, 500);
  }
});

// Update user experience and level
app.post('/make-server-b33c7dce/user/experience', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { experienceGain } = await c.req.json();
    
    const userData = await kv.get(`user:${user.id}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const newExperience = userData.experience + experienceGain;
    const newLevel = calculateLevel(newExperience);

    userData.experience = newExperience;
    userData.level = newLevel;

    await kv.set(`user:${user.id}`, userData);

    return c.json({ 
      experience: newExperience,
      level: newLevel 
    });
  } catch (error) {
    console.log('Update experience error:', error);
    return c.json({ error: 'Internal server error while updating experience' }, 500);
  }
});

// Create a post
app.post('/make-server-b33c7dce/posts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { type, gameName, title, content, tags } = await c.req.json();

    const postId = `post:${Date.now()}:${user.id}`;
    const post = {
      id: postId,
      userId: user.id,
      type,
      gameName,
      title,
      content,
      tags: tags || [],
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      comments: 0,
      views: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(postId, post);

    // Update tags if provided
    if (tags && tags.length > 0) {
      await updatePostTags(postId, tags);
    }

    // Update user stats
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.stats.postsCount += 1;
      // Award experience for posting (50 XP)
      userData.experience += 50;
      userData.level = calculateLevel(userData.experience);
      await kv.set(`user:${user.id}`, userData);
    }

    return c.json({ success: true, post });
  } catch (error) {
    console.log('Create post error:', error);
    return c.json({ error: 'Internal server error while creating post' }, 500);
  }
});

// Get posts (with pagination)
app.get('/make-server-b33c7dce/posts', async (c) => {
  try {
    const posts = await kv.getByPrefix('post:');
    
    // Sort by createdAt descending
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Attach user data to each post
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const userData = await kv.get(`user:${post.userId}`);
        return {
          ...post,
          author: userData ? {
            name: userData.name,
            avatar: userData.avatar,
            level: userData.level,
          } : null,
        };
      })
    );

    return c.json({ posts: postsWithUsers });
  } catch (error) {
    console.log('Get posts error:', error);
    return c.json({ error: 'Internal server error while fetching posts' }, 500);
  }
});

// Like a post
app.post('/make-server-b33c7dce/posts/:postId/like', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const post = await kv.get(postId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Initialize arrays if they don't exist
    if (!post.likedBy) post.likedBy = [];
    if (!post.dislikedBy) post.dislikedBy = [];

    // Check if user already liked
    const alreadyLiked = post.likedBy.includes(user.id);
    const alreadyDisliked = post.dislikedBy.includes(user.id);

    if (alreadyLiked) {
      // Unlike
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(id => id !== user.id);

      // Update author stats
      const authorData = await kv.get(`user:${post.userId}`);
      if (authorData) {
        authorData.stats.likesReceived -= 1;
        authorData.experience -= 10;
        authorData.level = calculateLevel(authorData.experience);
        await kv.set(`user:${post.userId}`, authorData);
      }
    } else {
      // Like
      post.likes += 1;
      post.likedBy.push(user.id);

      // Remove dislike if exists
      if (alreadyDisliked) {
        post.dislikes -= 1;
        post.dislikedBy = post.dislikedBy.filter(id => id !== user.id);
      }

      // Update author stats
      const authorData = await kv.get(`user:${post.userId}`);
      if (authorData) {
        authorData.stats.likesReceived += 1;
        authorData.experience += 10;
        authorData.level = calculateLevel(authorData.experience);
        await kv.set(`user:${post.userId}`, authorData);
      }
    }

    await kv.set(postId, post);

    return c.json({ 
      success: true, 
      likes: post.likes,
      dislikes: post.dislikes,
      isLiked: !alreadyLiked,
      isDisliked: false
    });
  } catch (error) {
    console.log('Like post error:', error);
    return c.json({ error: 'Internal server error while liking post' }, 500);
  }
});

// Dislike a post
app.post('/make-server-b33c7dce/posts/:postId/dislike', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const post = await kv.get(postId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Initialize arrays if they don't exist
    if (!post.likedBy) post.likedBy = [];
    if (!post.dislikedBy) post.dislikedBy = [];

    // Check if user already disliked
    const alreadyLiked = post.likedBy.includes(user.id);
    const alreadyDisliked = post.dislikedBy.includes(user.id);

    if (alreadyDisliked) {
      // Un-dislike
      post.dislikes -= 1;
      post.dislikedBy = post.dislikedBy.filter(id => id !== user.id);
    } else {
      // Dislike
      post.dislikes += 1;
      post.dislikedBy.push(user.id);

      // Remove like if exists
      if (alreadyLiked) {
        post.likes -= 1;
        post.likedBy = post.likedBy.filter(id => id !== user.id);

        // Update author stats
        const authorData = await kv.get(`user:${post.userId}`);
        if (authorData) {
          authorData.stats.likesReceived -= 1;
          authorData.experience -= 10;
          authorData.level = calculateLevel(authorData.experience);
          await kv.set(`user:${post.userId}`, authorData);
        }
      }
    }

    await kv.set(postId, post);

    return c.json({ 
      success: true, 
      likes: post.likes,
      dislikes: post.dislikes,
      isLiked: false,
      isDisliked: !alreadyDisliked
    });
  } catch (error) {
    console.log('Dislike post error:', error);
    return c.json({ error: 'Internal server error while disliking post' }, 500);
  }
});

// Delete a post
app.delete('/make-server-b33c7dce/posts/:postId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const post = await kv.get(postId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Check if user is the author
    if (post.userId !== user.id) {
      return c.json({ error: 'You can only delete your own posts' }, 403);
    }

    // Delete all comments for this post
    const comments = await kv.getByPrefix(`comment:${postId}:`);
    for (const comment of comments) {
      await kv.del(comment.id);
    }

    // Delete the post
    await kv.del(postId);

    // Update user stats
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.stats.postsCount -= 1;
      userData.stats.likesReceived -= (post.likes || 0);
      userData.experience -= 50; // Remove post creation XP
      userData.experience -= (post.likes || 0) * 10; // Remove likes XP
      userData.level = calculateLevel(Math.max(0, userData.experience));
      await kv.set(`user:${user.id}`, userData);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete post error:', error);
    return c.json({ error: 'Internal server error while deleting post' }, 500);
  }
});

// Add a comment to a post
app.post('/make-server-b33c7dce/posts/:postId/comments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const post = await kv.get(postId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    const { content } = await c.req.json();

    if (!content || content.trim() === '') {
      return c.json({ error: 'Comment content is required' }, 400);
    }

    const commentId = `comment:${postId}:${Date.now()}:${user.id}`;
    const comment = {
      id: commentId,
      postId,
      userId: user.id,
      content,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(commentId, comment);

    // Update post comment count
    post.comments = (post.comments || 0) + 1;
    await kv.set(postId, post);

    // Update user stats
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.stats.commentsCount += 1;
      // Award experience for commenting (5 XP)
      userData.experience += 5;
      userData.level = calculateLevel(userData.experience);
      await kv.set(`user:${user.id}`, userData);
    }

    // Get user data for response
    const commentUserData = await kv.get(`user:${user.id}`);
    
    return c.json({ 
      success: true, 
      comment: {
        ...comment,
        author: commentUserData ? {
          name: commentUserData.name,
          avatar: commentUserData.avatar,
          level: commentUserData.level,
        } : null
      }
    });
  } catch (error) {
    console.log('Add comment error:', error);
    return c.json({ error: 'Internal server error while adding comment' }, 500);
  }
});

// Get comments for a post
app.get('/make-server-b33c7dce/posts/:postId/comments', async (c) => {
  try {
    const postId = c.req.param('postId');
    const comments = await kv.getByPrefix(`comment:${postId}:`);
    
    // Sort by createdAt ascending (oldest first)
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Attach user data to each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const userData = await kv.get(`user:${comment.userId}`);
        return {
          ...comment,
          author: userData ? {
            name: userData.name,
            avatar: userData.avatar,
            level: userData.level,
          } : null,
        };
      })
    );

    return c.json({ comments: commentsWithUsers });
  } catch (error) {
    console.log('Get comments error:', error);
    return c.json({ error: 'Internal server error while fetching comments' }, 500);
  }
});

// Delete a comment
app.delete('/make-server-b33c7dce/comments/:commentId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const commentId = c.req.param('commentId');
    const comment = await kv.get(commentId);

    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    // Check if user is the author
    if (comment.userId !== user.id) {
      return c.json({ error: 'You can only delete your own comments' }, 403);
    }

    // Get post to update comment count
    const post = await kv.get(comment.postId);
    if (post) {
      post.comments = Math.max(0, (post.comments || 1) - 1);
      await kv.set(comment.postId, post);
    }

    // Delete the comment
    await kv.del(commentId);

    // Update user stats
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.stats.commentsCount -= 1;
      userData.experience -= 5;
      userData.level = calculateLevel(Math.max(0, userData.experience));
      await kv.set(`user:${user.id}`, userData);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete comment error:', error);
    return c.json({ error: 'Internal server error while deleting comment' }, 500);
  }
});

// Get leaderboard
app.get('/make-server-b33c7dce/leaderboard', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    
    // Calculate scores for each user
    const usersWithScores = users.map(user => {
      const score = calculateScore(
        user.stats.postsCount,
        user.stats.likesReceived,
        user.stats.commentsCount,
        0 // hotness can be calculated based on recent activity
      );
      return {
        ...user,
        score,
      };
    });

    // Sort by score descending
    usersWithScores.sort((a, b) => b.score - a.score);

    return c.json({ leaderboard: usersWithScores });
  } catch (error) {
    console.log('Get leaderboard error:', error);
    return c.json({ error: 'Internal server error while fetching leaderboard' }, 500);
  }
});

// Get user's posts
app.get('/make-server-b33c7dce/users/:userId/posts', async (c) => {
  try {
    const userId = c.req.param('userId');
    const allPosts = await kv.getByPrefix('post:');
    
    const userPosts = allPosts.filter(post => post.userId === userId);
    userPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ posts: userPosts });
  } catch (error) {
    console.log('Get user posts error:', error);
    return c.json({ error: 'Internal server error while fetching user posts' }, 500);
  }
});

// Get user profile by ID (public endpoint)
app.get('/make-server-b33c7dce/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: userData });
  } catch (error) {
    console.log('Get user profile error:', error);
    return c.json({ error: 'Internal server error while fetching user profile' }, 500);
  }
});

// Add friend
app.post('/make-server-b33c7dce/friends/add', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { friendId } = await c.req.json();
    
    // Store friendship
    const friendshipId = `friendship:${user.id}:${friendId}`;
    await kv.set(friendshipId, {
      userId: user.id,
      friendId,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    // Also store reverse friendship
    const reverseFriendshipId = `friendship:${friendId}:${user.id}`;
    await kv.set(reverseFriendshipId, {
      userId: friendId,
      friendId: user.id,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Add friend error:', error);
    return c.json({ error: 'Internal server error while adding friend' }, 500);
  }
});

// Get friends
app.get('/make-server-b33c7dce/friends', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const friendships = await kv.getByPrefix(`friendship:${user.id}:`);
    
    // Get friend user data
    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friendData = await kv.get(`user:${friendship.friendId}`);
        return friendData ? {
          id: friendData.id,
          name: friendData.name,
          avatar: friendData.avatar,
          status: 'online', // Could be enhanced with real status tracking
        } : null;
      })
    );

    return c.json({ friends: friends.filter(f => f !== null) });
  } catch (error) {
    console.log('Get friends error:', error);
    return c.json({ error: 'Internal server error while fetching friends' }, 500);
  }
});

// Remove friend
app.delete('/make-server-b33c7dce/friends/:friendId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const friendId = c.req.param('friendId');
    
    // Delete both friendships
    await kv.del(`friendship:${user.id}:${friendId}`);
    await kv.del(`friendship:${friendId}:${user.id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Remove friend error:', error);
    return c.json({ error: 'Internal server error while removing friend' }, 500);
  }
});

// Health check
app.get('/make-server-b33c7dce/health', (c) => {
  return c.json({ status: 'ok' });
});

// Upload avatar image
app.post('/make-server-b33c7dce/upload/avatar', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { image } = body; // base64 encoded image
    
    if (!image) {
      return c.json({ error: 'No image provided' }, 400);
    }

    // Create bucket if not exists
    const bucketName = 'make-b33c7dce-avatars';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
    }

    // Convert base64 to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Determine file extension from base64 string
    const mimeMatch = image.match(/^data:image\/(\w+);base64,/);
    const extension = mimeMatch ? mimeMatch[1] : 'png';
    
    // Generate unique filename
    const filename = `${user.id}_${Date.now()}.${extension}`;
    const filepath = `avatars/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filepath, buffer, {
        contentType: `image/${extension}`,
        upsert: false,
      });

    if (uploadError) {
      console.log('Upload error:', uploadError);
      return c.json({ error: uploadError.message }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filepath);

    return c.json({ 
      success: true, 
      url: publicUrl 
    });
  } catch (error) {
    console.log('Avatar upload error:', error);
    return c.json({ error: 'Internal server error while uploading avatar' }, 500);
  }
});

// ========================================
// NEW FEATURES APIs
// ========================================

// Update user profile
app.put('/make-server-b33c7dce/users/:userId/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId');
    
    // Check if user is updating their own profile
    if (user.id !== userId) {
      return c.json({ error: 'Cannot update other users profile' }, 403);
    }

    const { name, avatar, bio } = await c.req.json();
    
    // Get current user data
    const existingUser = await kv.get(`user:${userId}`);
    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update user data
    const updatedUser = {
      ...existingUser,
      name: name || existingUser.name,
      avatar: avatar || existingUser.avatar,
      bio: bio !== undefined ? bio : existingUser.bio,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedUser);

    return c.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.log('Update profile error:', error);
    return c.json({ error: 'Internal server error while updating profile' }, 500);
  }
});

// Game search
app.get('/make-server-b33c7dce/games/search', async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    
    if (!query || query.length < 2) {
      return c.json({ games: [] });
    }

    // Get all games from KV store
    const gamesData = await kv.getByPrefix('game:');
    
    // Filter games by query
    const filteredGames = gamesData
      .filter((game: any) => 
        game.name.toLowerCase().includes(query) ||
        game.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      )
      .slice(0, 20); // Limit to 20 results

    return c.json({ games: filteredGames });
  } catch (error) {
    console.log('Game search error:', error);
    return c.json({ error: 'Internal server error while searching games' }, 500);
  }
});

// Add game to user library
app.post('/make-server-b33c7dce/users/:userId/games', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId');
    
    if (user.id !== userId) {
      return c.json({ error: 'Cannot modify other users library' }, 403);
    }

    const { gameId, gameName, cover, status, playTime, achievement } = await c.req.json();
    
    const userGame = {
      id: `${userId}:${gameId}`,
      userId,
      gameId,
      gameName,
      cover,
      status: status || 'playing', // playing, completed, wishlist, dropped
      playTime: playTime || 0,
      achievement: achievement || 0,
      addedAt: new Date().toISOString(),
    };

    await kv.set(`usergame:${userId}:${gameId}`, userGame);

    // Update user stats
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      const currentGames = await kv.getByPrefix(`usergame:${userId}:`);
      userData.stats.gamesCount = currentGames.length;
      await kv.set(`user:${userId}`, userData);
    }

    return c.json({ success: true, game: userGame });
  } catch (error) {
    console.log('Add game error:', error);
    return c.json({ error: 'Internal server error while adding game' }, 500);
  }
});

// Get user game library
app.get('/make-server-b33c7dce/users/:userId/games', async (c) => {
  try {
    const userId = c.req.param('userId');
    const games = await kv.getByPrefix(`usergame:${userId}:`);
    
    return c.json({ games });
  } catch (error) {
    console.log('Get user games error:', error);
    return c.json({ error: 'Internal server error while fetching games' }, 500);
  }
});

// Update game in user library
app.put('/make-server-b33c7dce/users/:userId/games/:gameId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId');
    const gameId = c.req.param('gameId');
    
    if (user.id !== userId) {
      return c.json({ error: 'Cannot modify other users library' }, 403);
    }

    const { status, playTime, achievement } = await c.req.json();
    
    const existingGame = await kv.get(`usergame:${userId}:${gameId}`);
    if (!existingGame) {
      return c.json({ error: 'Game not found in library' }, 404);
    }

    const updatedGame = {
      ...existingGame,
      status: status !== undefined ? status : existingGame.status,
      playTime: playTime !== undefined ? playTime : existingGame.playTime,
      achievement: achievement !== undefined ? achievement : existingGame.achievement,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`usergame:${userId}:${gameId}`, updatedGame);

    return c.json({ success: true, game: updatedGame });
  } catch (error) {
    console.log('Update game error:', error);
    return c.json({ error: 'Internal server error while updating game' }, 500);
  }
});

// Delete game from user library
app.delete('/make-server-b33c7dce/users/:userId/games/:gameId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId');
    const gameId = c.req.param('gameId');
    
    if (user.id !== userId) {
      return c.json({ error: 'Cannot modify other users library' }, 403);
    }

    await kv.del(`usergame:${userId}:${gameId}`);

    // Update user stats
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      const currentGames = await kv.getByPrefix(`usergame:${userId}:`);
      userData.stats.gamesCount = currentGames.length;
      await kv.set(`user:${userId}`, userData);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete game error:', error);
    return c.json({ error: 'Internal server error while deleting game' }, 500);
  }
});

// Increment post view count
app.post('/make-server-b33c7dce/posts/:postId/view', async (c) => {
  try {
    const postId = c.req.param('postId');
    
    const post = await kv.get(`post:${postId}`);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    post.views = (post.views || 0) + 1;
    await kv.set(`post:${postId}`, post);

    return c.json({ success: true, views: post.views });
  } catch (error) {
    console.log('Increment view error:', error);
    return c.json({ error: 'Internal server error while incrementing views' }, 500);
  }
});

// Initialize some sample games (run once)
app.post('/make-server-b33c7dce/admin/init-games', async (c) => {
  try {
    const sampleGames = [
      { id: 'game1', name: 'Elden Ring', cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400', tags: ['RPG', 'Dark Souls', 'Open World'] },
      { id: 'game2', name: 'The Legend of Zelda: Tears of the Kingdom', cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', tags: ['Adventure', 'Action', 'Open World'] },
      { id: 'game3', name: 'Baldurs Gate 3', cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', tags: ['RPG', 'Strategy', 'Fantasy'] },
      { id: 'game4', name: 'Cyberpunk 2077', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', tags: ['RPG', 'Sci-Fi', 'Open World'] },
      { id: 'game5', name: 'Red Dead Redemption 2', cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400', tags: ['Action', 'Adventure', 'Western'] },
      { id: 'game6', name: 'God of War Ragnarök', cover: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400', tags: ['Action', 'Adventure', 'Mythology'] },
      { id: 'game7', name: 'Minecraft', cover: 'https://images.unsplash.com/photo-1587731556938-38755b4803a6?w=400', tags: ['Sandbox', 'Survival', 'Creative'] },
      { id: 'game8', name: 'Valorant', cover: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400', tags: ['FPS', 'Tactical', 'Competitive'] },
      { id: 'game9', name: 'League of Legends', cover: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400', tags: ['MOBA', 'Strategy', 'Competitive'] },
      { id: 'game10', name: 'Stardew Valley', cover: 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=400', tags: ['Simulation', 'Farming', 'RPG'] },
    ];

    for (const game of sampleGames) {
      await kv.set(`game:${game.id}`, game);
    }

    return c.json({ success: true, message: 'Games initialized', count: sampleGames.length });
  } catch (error) {
    console.log('Init games error:', error);
    return c.json({ error: 'Internal server error while initializing games' }, 500);
  }
});

// Get trending posts (most viewed and liked)
app.get('/make-server-b33c7dce/posts/trending', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    
    // Get all posts from our platform
    const allPosts = await kv.getByPrefix('post:');
    
    // Calculate trending score: views * 0.3 + likes * 0.7
    const postsWithScore = allPosts.map((post: any) => ({
      ...post,
      trendingScore: (post.views || 0) * 0.3 + (post.likes || 0) * 0.7,
      isExternal: false,
      url: null // Internal posts don't have external URL
    }));
    
    // Sort by trending score
    const localTrending = postsWithScore
      .sort((a: any, b: any) => b.trendingScore - a.trendingScore);
    
    // External trending posts (mock data from other gaming sites)
    // In production, this would fetch from real APIs
    const externalPosts = [
      {
        id: 'ext-1',
        title: 'Elden Ring DLC Shadow of the Erdtree - Full Boss Guide',
        gameName: 'Elden Ring',
        views: 15420,
        likes: 892,
        trendingScore: 5249,
        isExternal: true,
        url: 'https://www.ign.com/games/elden-ring',
        source: 'IGN'
      },
      {
        id: 'ext-2',
        title: 'The Legend of Zelda: TOTK - All Shrine Locations',
        gameName: 'The Legend of Zelda: Tears of the Kingdom',
        views: 12350,
        likes: 745,
        trendingScore: 4226.5,
        isExternal: true,
        url: 'https://www.polygon.com/zelda-tears-of-the-kingdom-totk-guide',
        source: 'Polygon'
      },
      {
        id: 'ext-3',
        title: 'Baldurs Gate 3 - Best Character Builds for Act 3',
        gameName: 'Baldurs Gate 3',
        views: 10890,
        likes: 654,
        trendingScore: 3725.2,
        isExternal: true,
        url: 'https://www.pcgamer.com/baldurs-gate-3',
        source: 'PC Gamer'
      },
      {
        id: 'ext-4',
        title: 'Cyberpunk 2077 Phantom Liberty - Secret Endings Guide',
        gameName: 'Cyberpunk 2077',
        views: 9870,
        likes: 587,
        trendingScore: 3372.1,
        isExternal: true,
        url: 'https://www.gamespot.com/games/cyberpunk-2077',
        source: 'GameSpot'
      },
      {
        id: 'ext-5',
        title: 'Red Dead Redemption 2 - Hidden Locations You Missed',
        gameName: 'Red Dead Redemption 2',
        views: 8750,
        likes: 512,
        trendingScore: 2983.4,
        isExternal: true,
        url: 'https://www.rockstargames.com/reddeadredemption2',
        source: 'Rockstar'
      },
      {
        id: 'ext-6',
        title: 'God of War Ragnarök - All Collectibles Guide',
        gameName: 'God of War Ragnarök',
        views: 7650,
        likes: 445,
        trendingScore: 2606.5,
        isExternal: true,
        url: 'https://www.playstation.com/god-of-war-ragnarok',
        source: 'PlayStation'
      },
      {
        id: 'ext-7',
        title: 'Minecraft 1.21 Update - New Features Breakdown',
        gameName: 'Minecraft',
        views: 11200,
        likes: 678,
        trendingScore: 3834.6,
        isExternal: true,
        url: 'https://www.minecraft.net',
        source: 'Minecraft.net'
      },
      {
        id: 'ext-8',
        title: 'Valorant Episode 8 - New Agent Abilities Analysis',
        gameName: 'Valorant',
        views: 9340,
        likes: 534,
        trendingScore: 3175.8,
        isExternal: true,
        url: 'https://playvalorant.com',
        source: 'Riot Games'
      },
      {
        id: 'ext-9',
        title: 'League of Legends Season 14 - Meta Tier List',
        gameName: 'League of Legends',
        views: 13450,
        likes: 789,
        trendingScore: 4587.3,
        isExternal: true,
        url: 'https://www.leagueoflegends.com',
        source: 'Riot Games'
      },
      {
        id: 'ext-10',
        title: 'Stardew Valley 1.6 - New Farm Types Guide',
        gameName: 'Stardew Valley',
        views: 6890,
        likes: 423,
        trendingScore: 2363.1,
        isExternal: true,
        url: 'https://www.stardewvalley.net',
        source: 'ConcernedApe'
      }
    ];
    
    // Determine the threshold for prioritizing local content
    const localContentThreshold = 5; // If we have at least 5 local posts, prioritize them
    
    let finalTrending;
    if (localTrending.length >= localContentThreshold) {
      // Prioritize local content when we have enough
      // Mix: 70% local, 30% external
      const localCount = Math.ceil(limit * 0.7);
      const externalCount = limit - localCount;
      
      finalTrending = [
        ...localTrending.slice(0, localCount),
        ...externalPosts.slice(0, externalCount)
      ];
    } else {
      // When local content is insufficient, mix both
      finalTrending = [...localTrending, ...externalPosts]
        .sort((a: any, b: any) => b.trendingScore - a.trendingScore)
        .slice(0, limit);
    }
    
    return c.json({ posts: finalTrending });
  } catch (error) {
    console.log('Get trending posts error:', error);
    return c.json({ error: 'Internal server error while fetching trending posts' }, 500);
  }
});

// Get trending games (most discussed)
app.get('/make-server-b33c7dce/games/trending', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    
    // Get all posts
    const allPosts = await kv.getByPrefix('post:');
    
    // Count posts per game (local data)
    const gameStats: Record<string, { count: number, totalLikes: number, totalViews: number, gameName: string, isExternal: boolean }> = {};
    
    for (const post of allPosts) {
      if (post.gameName) {
        if (!gameStats[post.gameName]) {
          gameStats[post.gameName] = {
            count: 0,
            totalLikes: 0,
            totalViews: 0,
            gameName: post.gameName,
            isExternal: false
          };
        }
        gameStats[post.gameName].count += 1;
        gameStats[post.gameName].totalLikes += post.likes || 0;
        gameStats[post.gameName].totalViews += post.views || 0;
      }
    }
    
    // Calculate trending score: postCount * 10 + totalLikes * 2 + totalViews
    const localGamesArray = Object.values(gameStats).map((stats: any) => ({
      ...stats,
      trendingScore: stats.count * 10 + stats.totalLikes * 2 + stats.totalViews
    }));
    
    // External trending games data (mock data from other gaming platforms)
    const externalGames = [
      {
        gameName: 'Elden Ring',
        count: 1247,
        totalLikes: 8934,
        totalViews: 45678,
        trendingScore: 12470 + 17868 + 45678,
        isExternal: true
      },
      {
        gameName: 'The Legend of Zelda: Tears of the Kingdom',
        count: 1089,
        totalLikes: 7456,
        totalViews: 38920,
        trendingScore: 10890 + 14912 + 38920,
        isExternal: true
      },
      {
        gameName: 'Baldurs Gate 3',
        count: 956,
        totalLikes: 6789,
        totalViews: 34210,
        trendingScore: 9560 + 13578 + 34210,
        isExternal: true
      },
      {
        gameName: 'Cyberpunk 2077',
        count: 834,
        totalLikes: 5890,
        totalViews: 29450,
        trendingScore: 8340 + 11780 + 29450,
        isExternal: true
      },
      {
        gameName: 'Red Dead Redemption 2',
        count: 723,
        totalLikes: 5123,
        totalViews: 25680,
        trendingScore: 7230 + 10246 + 25680,
        isExternal: true
      },
      {
        gameName: 'God of War Ragnarök',
        count: 678,
        totalLikes: 4567,
        totalViews: 22340,
        trendingScore: 6780 + 9134 + 22340,
        isExternal: true
      },
      {
        gameName: 'Minecraft',
        count: 1456,
        totalLikes: 9876,
        totalViews: 52340,
        trendingScore: 14560 + 19752 + 52340,
        isExternal: true
      },
      {
        gameName: 'Valorant',
        count: 1123,
        totalLikes: 7890,
        totalViews: 41230,
        trendingScore: 11230 + 15780 + 41230,
        isExternal: true
      },
      {
        gameName: 'League of Legends',
        count: 1345,
        totalLikes: 8765,
        totalViews: 48920,
        trendingScore: 13450 + 17530 + 48920,
        isExternal: true
      },
      {
        gameName: 'Stardew Valley',
        count: 567,
        totalLikes: 3890,
        totalViews: 19340,
        trendingScore: 5670 + 7780 + 19340,
        isExternal: true
      }
    ];
    
    // Determine the threshold for prioritizing local content
    const localContentThreshold = 5; // If we have at least 5 games, prioritize them
    
    let finalTrending;
    if (localGamesArray.length >= localContentThreshold) {
      // Prioritize local content when we have enough
      // Mix: 70% local, 30% external
      const localCount = Math.ceil(limit * 0.7);
      const externalCount = limit - localCount;
      
      const sortedLocal = localGamesArray.sort((a, b) => b.trendingScore - a.trendingScore);
      const sortedExternal = externalGames.sort((a, b) => b.trendingScore - a.trendingScore);
      
      finalTrending = [
        ...sortedLocal.slice(0, localCount),
        ...sortedExternal.slice(0, externalCount)
      ];
    } else {
      // When local content is insufficient, mix both
      finalTrending = [...localGamesArray, ...externalGames]
        .sort((a: any, b: any) => b.trendingScore - a.trendingScore)
        .slice(0, limit);
    }
    
    return c.json({ games: finalTrending });
  } catch (error) {
    console.log('Get trending games error:', error);
    return c.json({ error: 'Internal server error while fetching trending games' }, 500);
  }
});

// ============== SOCIAL FEATURES ROUTES ==============

// Get notifications for a user
app.get('/make-server-b33c7dce/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notifications = await kv.getByPrefix(`notification:${user.id}:`);
    
    const notificationsArray = notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Limit to 50 most recent

    return c.json({ notifications: notificationsArray });
  } catch (error) {
    console.log('Get notifications error:', error);
    return c.json({ error: 'Internal server error while fetching notifications' }, 500);
  }
});

// Mark notification as read
app.post('/make-server-b33c7dce/notifications/:notificationId/read', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationId = c.req.param('notificationId');
    const notification = await kv.get(notificationId);

    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    if (!notificationId.includes(user.id)) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    notification.read = true;
    await kv.set(notificationId, notification);

    return c.json({ success: true });
  } catch (error) {
    console.log('Mark notification as read error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Mark all notifications as read
app.post('/make-server-b33c7dce/notifications/read-all', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notifications = await kv.getByPrefix(`notification:${user.id}:`);
    
    await Promise.all(
      notifications.map(async (notification) => {
        notification.read = true;
        await kv.set(notification.id, notification);
      })
    );

    return c.json({ success: true });
  } catch (error) {
    console.log('Mark all notifications as read error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Helper function to create a notification
async function createNotification(
  recipientId: string,
  actorId: string,
  actorName: string,
  actorAvatar: string,
  type: string,
  targetType: string,
  targetId: string,
  content?: string
) {
  const notificationId = `notification:${recipientId}:${Date.now()}:${actorId}`;
  const notification = {
    id: notificationId,
    type,
    actorId,
    actorName,
    actorAvatar,
    targetType,
    targetId,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  await kv.set(notificationId, notification);
}

// Share a post (creates a shared activity)
app.post('/make-server-b33c7dce/posts/:postId/share', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const post = await kv.get(postId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    const userData = await kv.get(`user:${user.id}`);
    
    // Create share activity
    const activityId = `activity:${user.id}:${Date.now()}`;
    const activity = {
      id: activityId,
      userId: user.id,
      userName: userData.name,
      userAvatar: userData.avatar,
      type: 'share',
      action: 'shared a post',
      targetTitle: post.title || post.gameName,
      targetId: postId,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    await kv.set(activityId, activity);

    // Increment share count on post
    post.shares = (post.shares || 0) + 1;
    await kv.set(postId, post);

    // Create notification for post author (if not sharing own post)
    if (post.userId !== user.id) {
      await createNotification(
        post.userId,
        user.id,
        userData.name,
        userData.avatar,
        'share',
        'post',
        postId,
        post.title || post.gameName
      );
    }

    return c.json({ success: true, activity });
  } catch (error) {
    console.log('Share post error:', error);
    return c.json({ error: 'Internal server error while sharing post' }, 500);
  }
});

// Get activity feed (from friends and followed users)
app.get('/make-server-b33c7dce/activities/feed', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user's friends
    const friends = await kv.getByPrefix(`friend:${user.id}:`);
    const friendIds = friends.map(f => f.friendId);

    // Get activities from friends
    const allActivities = await kv.getByPrefix('activity:');
    const friendActivities = allActivities.filter(a => 
      friendIds.includes(a.userId) || a.userId === user.id
    );

    const activities = friendActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    return c.json({ activities });
  } catch (error) {
    console.log('Get activity feed error:', error);
    return c.json({ error: 'Internal server error while fetching activity feed' }, 500);
  }
});

// Get activities for a specific user
app.get('/make-server-b33c7dce/users/:userId/activities', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const activities = await kv.getByPrefix(`activity:${userId}:`);
    
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 30);

    return c.json({ activities: sortedActivities });
  } catch (error) {
    console.log('Get user activities error:', error);
    return c.json({ error: 'Internal server error while fetching user activities' }, 500);
  }
});

// Get user online status
app.get('/make-server-b33c7dce/users/:userId/status', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const statusKey = `status:${userId}`;
    const status = await kv.get(statusKey);

    if (!status) {
      return c.json({ isOnline: false, lastSeen: null });
    }

    // Consider online if last activity was within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const lastActivity = new Date(status.lastActivity);
    const isOnline = lastActivity > fiveMinutesAgo;

    return c.json({ 
      isOnline, 
      lastSeen: status.lastActivity 
    });
  } catch (error) {
    console.log('Get user status error:', error);
    return c.json({ error: 'Internal server error while fetching user status' }, 500);
  }
});

// Update user online status (called periodically by client)
app.post('/make-server-b33c7dce/users/status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const statusKey = `status:${user.id}`;
    await kv.set(statusKey, {
      userId: user.id,
      lastActivity: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Update user status error:', error);
    return c.json({ error: 'Internal server error while updating user status' }, 500);
  }
});

// Update like handler to create notification
// (We need to modify the existing like endpoint to add notifications)

// ==================== REACTIONS API ====================

// Add reaction to a post
app.post('/make-server-b33c7dce/posts/:postId/reactions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const { emoji } = await c.req.json();

    if (!emoji) {
      return c.json({ error: 'Emoji is required' }, 400);
    }

    // Get or create reactions for this post
    const reactionsKey = `reactions:${postId}`;
    let reactions = await kv.get(reactionsKey) || {};

    // Initialize emoji count if it doesn't exist
    if (!reactions[emoji]) {
      reactions[emoji] = { count: 0, users: [] };
    }

    // Check if user already reacted with this emoji
    const userIndex = reactions[emoji].users.indexOf(user.id);
    
    if (userIndex > -1) {
      // Remove reaction
      reactions[emoji].users.splice(userIndex, 1);
      reactions[emoji].count--;
      
      // Remove emoji key if count is 0
      if (reactions[emoji].count === 0) {
        delete reactions[emoji];
      }
    } else {
      // Add reaction
      reactions[emoji].users.push(user.id);
      reactions[emoji].count++;
    }

    await kv.set(reactionsKey, reactions);

    return c.json({ 
      success: true, 
      reactions,
      userReacted: userIndex === -1
    });
  } catch (error) {
    console.log('Add reaction error:', error);
    return c.json({ error: 'Internal server error while adding reaction' }, 500);
  }
});

// Get reactions for a post
app.get('/make-server-b33c7dce/posts/:postId/reactions', async (c) => {
  try {
    const postId = c.req.param('postId');
    const reactionsKey = `reactions:${postId}`;
    const reactions = await kv.get(reactionsKey) || {};

    return c.json({ reactions });
  } catch (error) {
    console.log('Get reactions error:', error);
    return c.json({ error: 'Internal server error while fetching reactions' }, 500);
  }
});

// ==================== BOOKMARKS API ====================

// Bookmark/unbookmark a post
app.post('/make-server-b33c7dce/bookmarks/:postId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const bookmarksKey = `bookmarks:${user.id}`;
    
    let bookmarks = await kv.get(bookmarksKey) || [];

    const index = bookmarks.indexOf(postId);
    let isBookmarked = false;

    if (index > -1) {
      // Remove bookmark
      bookmarks.splice(index, 1);
    } else {
      // Add bookmark
      bookmarks.unshift(postId); // Add to beginning
      isBookmarked = true;
    }

    await kv.set(bookmarksKey, bookmarks);

    return c.json({ 
      success: true, 
      isBookmarked
    });
  } catch (error) {
    console.log('Bookmark error:', error);
    return c.json({ error: 'Internal server error while bookmarking' }, 500);
  }
});

// Get user's bookmarks
app.get('/make-server-b33c7dce/bookmarks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookmarksKey = `bookmarks:${user.id}`;
    const bookmarkIds = await kv.get(bookmarksKey) || [];

    // Fetch post details for each bookmark
    const posts = await Promise.all(
      bookmarkIds.map(async (postId: string) => {
        const post = await kv.get(`post:${postId}`);
        if (!post) return null;

        // Get author info
        const author = await kv.get(`user:${post.userId}`);
        
        return {
          ...post,
          author: author ? {
            id: author.id,
            name: author.name,
            avatar: author.avatar
          } : null
        };
      })
    );

    // Filter out null posts (deleted posts)
    const validPosts = posts.filter(post => post !== null);

    return c.json({ bookmarks: validPosts });
  } catch (error) {
    console.log('Get bookmarks error:', error);
    return c.json({ error: 'Internal server error while fetching bookmarks' }, 500);
  }
});

// Check if post is bookmarked
app.get('/make-server-b33c7dce/bookmarks/:postId/status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ isBookmarked: false });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ isBookmarked: false });
    }

    const postId = c.req.param('postId');
    const bookmarksKey = `bookmarks:${user.id}`;
    const bookmarks = await kv.get(bookmarksKey) || [];

    return c.json({ isBookmarked: bookmarks.includes(postId) });
  } catch (error) {
    console.log('Check bookmark status error:', error);
    return c.json({ isBookmarked: false });
  }
});

// ==================== TAGS/TOPICS API ====================

// Get all popular tags
app.get('/make-server-b33c7dce/tags', async (c) => {
  try {
    const tagsData = await kv.get('tags:stats') || {};
    
    // Convert to array and sort by count
    const tags = Object.entries(tagsData)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 50); // Top 50 tags

    return c.json({ tags });
  } catch (error) {
    console.log('Get tags error:', error);
    return c.json({ error: 'Internal server error while fetching tags' }, 500);
  }
});

// Get posts by tag
app.get('/make-server-b33c7dce/tags/:tag/posts', async (c) => {
  try {
    const tag = c.req.param('tag');
    const tagPostsKey = `tag:${tag.toLowerCase()}:posts`;
    
    const postIds = await kv.get(tagPostsKey) || [];
    
    // Fetch post details
    const posts = await Promise.all(
      postIds.map(async (postId: string) => {
        const post = await kv.get(`post:${postId}`);
        if (!post) return null;

        // Get author info
        const author = await kv.get(`user:${post.userId}`);
        
        return {
          ...post,
          author: author ? {
            id: author.id,
            name: author.name,
            avatar: author.avatar
          } : null
        };
      })
    );

    const validPosts = posts
      .filter(post => post !== null)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ posts: validPosts, tag });
  } catch (error) {
    console.log('Get posts by tag error:', error);
    return c.json({ error: 'Internal server error while fetching posts by tag' }, 500);
  }
});

// Add tags to a post (called when creating/updating post)
async function updatePostTags(postId: string, tags: string[]) {
  try {
    // Get current tags stats
    const tagsData = await kv.get('tags:stats') || {};
    
    // Update tag counts and post associations
    for (const tag of tags) {
      const normalizedTag = tag.toLowerCase().trim();
      
      // Update tag count
      tagsData[normalizedTag] = (tagsData[normalizedTag] || 0) + 1;
      
      // Add post to tag's post list
      const tagPostsKey = `tag:${normalizedTag}:posts`;
      const tagPosts = await kv.get(tagPostsKey) || [];
      
      if (!tagPosts.includes(postId)) {
        tagPosts.unshift(postId);
        await kv.set(tagPostsKey, tagPosts);
      }
    }
    
    // Save updated tags stats
    await kv.set('tags:stats', tagsData);
  } catch (error) {
    console.log('Update post tags error:', error);
  }
}

// ==================== DIRECT MESSAGES ====================

// Send a direct message
app.post('/make-server-b33c7dce/messages/send', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { recipientId, content } = await c.req.json();

    if (!recipientId || !content) {
      return c.json({ error: 'Recipient and content are required' }, 400);
    }

    // Check if recipient exists
    const recipient = await kv.get(`user:${recipientId}`);
    if (!recipient) {
      return c.json({ error: 'Recipient not found' }, 404);
    }

    const messageId = `message:${Date.now()}:${user.id}:${recipientId}`;
    const message = {
      id: messageId,
      senderId: user.id,
      recipientId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(messageId, message);

    // Create notification for recipient
    const notificationId = `notification:${Date.now()}:${recipientId}`;
    const senderData = await kv.get(`user:${user.id}`);
    const notification = {
      id: notificationId,
      userId: recipientId,
      type: 'message',
      fromUserId: user.id,
      fromUserName: senderData?.name || 'User',
      fromUserAvatar: senderData?.avatar || '',
      message: `New message from ${senderData?.name || 'User'}`,
      read: false,
      messageId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(notificationId, notification);

    return c.json({ success: true, message });
  } catch (error) {
    console.log('Send message error:', error);
    return c.json({ error: 'Internal server error while sending message' }, 500);
  }
});

// Get conversations (list of users you have messages with)
app.get('/make-server-b33c7dce/messages/conversations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allMessages = await kv.getByPrefix('message:');
    
    // Filter messages involving this user
    const userMessages = allMessages.filter(
      (msg: any) => msg.senderId === user.id || msg.recipientId === user.id
    );

    // Group by conversation partner
    const conversationsMap = new Map();
    
    for (const msg of userMessages) {
      const partnerId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
      
      if (!conversationsMap.has(partnerId)) {
        const partner = await kv.get(`user:${partnerId}`);
        const unreadCount = userMessages.filter(
          (m: any) => m.senderId === partnerId && m.recipientId === user.id && !m.read
        ).length;

        conversationsMap.set(partnerId, {
          userId: partnerId,
          userName: partner?.name || 'Unknown User',
          userAvatar: partner?.avatar || '',
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount,
        });
      } else {
        // Update if this message is more recent
        const existing = conversationsMap.get(partnerId);
        if (new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
          existing.lastMessage = msg.content;
          existing.lastMessageTime = msg.createdAt;
        }
      }
    }

    const conversations = Array.from(conversationsMap.values());
    conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    return c.json({ conversations });
  } catch (error) {
    console.log('Get conversations error:', error);
    return c.json({ error: 'Internal server error while fetching conversations' }, 500);
  }
});

// Get messages with a specific user
app.get('/make-server-b33c7dce/messages/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const otherUserId = c.req.param('userId');
    const allMessages = await kv.getByPrefix('message:');
    
    // Filter messages between these two users
    const conversation = allMessages.filter(
      (msg: any) => 
        (msg.senderId === user.id && msg.recipientId === otherUserId) ||
        (msg.senderId === otherUserId && msg.recipientId === user.id)
    );

    // Sort by time
    conversation.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Mark messages as read
    for (const msg of conversation) {
      if (msg.recipientId === user.id && !msg.read) {
        msg.read = true;
        await kv.set(msg.id, msg);
      }
    }

    // Get other user info
    const otherUser = await kv.get(`user:${otherUserId}`);

    return c.json({ 
      messages: conversation,
      otherUser: otherUser ? {
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar,
      } : null
    });
  } catch (error) {
    console.log('Get messages error:', error);
    return c.json({ error: 'Internal server error while fetching messages' }, 500);
  }
});

// Delete a message
app.delete('/make-server-b33c7dce/messages/:messageId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const messageId = c.req.param('messageId');
    const message = await kv.get(messageId);

    if (!message) {
      return c.json({ error: 'Message not found' }, 404);
    }

    // Only sender can delete
    if (message.senderId !== user.id) {
      return c.json({ error: 'Unauthorized to delete this message' }, 403);
    }

    await kv.del(messageId);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete message error:', error);
    return c.json({ error: 'Internal server error while deleting message' }, 500);
  }
});

// ==================== NESTED REPLIES ====================

// Add a reply to a comment
app.post('/make-server-b33c7dce/comments/:commentId/replies', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const commentId = c.req.param('commentId');
    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    // Get parent comment
    const parentComment = await kv.get(commentId);
    if (!parentComment) {
      return c.json({ error: 'Parent comment not found' }, 404);
    }

    const replyId = `reply:${Date.now()}:${user.id}`;
    const reply = {
      id: replyId,
      commentId,
      postId: parentComment.postId,
      userId: user.id,
      content,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    await kv.set(replyId, reply);

    // Update parent comment reply count
    if (!parentComment.replies) {
      parentComment.replies = 0;
    }
    parentComment.replies += 1;
    await kv.set(commentId, parentComment);

    // Get user data
    const userData = await kv.get(`user:${user.id}`);

    // Create notification for comment author
    if (parentComment.userId !== user.id) {
      const notificationId = `notification:${Date.now()}:${parentComment.userId}`;
      const notification = {
        id: notificationId,
        userId: parentComment.userId,
        type: 'reply',
        fromUserId: user.id,
        fromUserName: userData?.name || 'User',
        fromUserAvatar: userData?.avatar || '',
        commentId,
        replyId,
        postId: parentComment.postId,
        message: `${userData?.name || 'User'} replied to your comment`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await kv.set(notificationId, notification);
    }

    return c.json({ 
      success: true, 
      reply: {
        ...reply,
        author: userData ? {
          name: userData.name,
          avatar: userData.avatar,
        } : null,
      }
    });
  } catch (error) {
    console.log('Add reply error:', error);
    return c.json({ error: 'Internal server error while adding reply' }, 500);
  }
});

// Get replies for a comment
app.get('/make-server-b33c7dce/comments/:commentId/replies', async (c) => {
  try {
    const commentId = c.req.param('commentId');
    const allReplies = await kv.getByPrefix('reply:');
    
    const replies = allReplies.filter((reply: any) => reply.commentId === commentId);
    
    // Sort by time
    replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Attach user data
    const repliesWithUsers = await Promise.all(
      replies.map(async (reply: any) => {
        const userData = await kv.get(`user:${reply.userId}`);
        return {
          ...reply,
          author: userData ? {
            name: userData.name,
            avatar: userData.avatar,
            level: userData.level,
          } : null,
        };
      })
    );

    return c.json({ replies: repliesWithUsers });
  } catch (error) {
    console.log('Get replies error:', error);
    return c.json({ error: 'Internal server error while fetching replies' }, 500);
  }
});

// Delete a reply
app.delete('/make-server-b33c7dce/replies/:replyId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const replyId = c.req.param('replyId');
    const reply = await kv.get(replyId);

    if (!reply) {
      return c.json({ error: 'Reply not found' }, 404);
    }

    // Only author can delete
    if (reply.userId !== user.id) {
      return c.json({ error: 'Unauthorized to delete this reply' }, 403);
    }

    // Update parent comment reply count
    const parentComment = await kv.get(reply.commentId);
    if (parentComment && parentComment.replies) {
      parentComment.replies -= 1;
      await kv.set(reply.commentId, parentComment);
    }

    await kv.del(replyId);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete reply error:', error);
    return c.json({ error: 'Internal server error while deleting reply' }, 500);
  }
});

// ==================== REPORT SYSTEM ====================

// Report a post or comment
app.post('/make-server-b33c7dce/reports', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { targetType, targetId, reason, description } = await c.req.json();

    if (!targetType || !targetId || !reason) {
      return c.json({ error: 'Target type, ID, and reason are required' }, 400);
    }

    const reportId = `report:${Date.now()}:${user.id}`;
    const report = {
      id: reportId,
      reporterId: user.id,
      targetType, // 'post', 'comment', 'user'
      targetId,
      reason,
      description: description || '',
      status: 'pending', // pending, reviewed, resolved, dismissed
      createdAt: new Date().toISOString(),
    };

    await kv.set(reportId, report);

    return c.json({ success: true, report });
  } catch (error) {
    console.log('Create report error:', error);
    return c.json({ error: 'Internal server error while creating report' }, 500);
  }
});

// Get all reports (admin only - simplified for now)
app.get('/make-server-b33c7dce/reports', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allReports = await kv.getByPrefix('report:');
    
    // Sort by date
    allReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Attach reporter data
    const reportsWithData = await Promise.all(
      allReports.map(async (report: any) => {
        const reporter = await kv.get(`user:${report.reporterId}`);
        return {
          ...report,
          reporter: reporter ? {
            name: reporter.name,
            avatar: reporter.avatar,
          } : null,
        };
      })
    );

    return c.json({ reports: reportsWithData });
  } catch (error) {
    console.log('Get reports error:', error);
    return c.json({ error: 'Internal server error while fetching reports' }, 500);
  }
});

// Update report status
app.put('/make-server-b33c7dce/reports/:reportId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reportId = c.req.param('reportId');
    const { status, action } = await c.req.json();

    const report = await kv.get(reportId);
    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }

    report.status = status;
    report.reviewedBy = user.id;
    report.reviewedAt = new Date().toISOString();
    report.action = action || '';

    await kv.set(reportId, report);

    return c.json({ success: true, report });
  } catch (error) {
    console.log('Update report error:', error);
    return c.json({ error: 'Internal server error while updating report' }, 500);
  }
});

// ==================== GAME RATINGS ====================

// Rate a game
app.post('/make-server-b33c7dce/games/:gameId/rate', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const gameId = c.req.param('gameId');
    const { rating, review } = await c.req.json();

    if (!rating || rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    const ratingId = `rating:${gameId}:${user.id}`;
    const ratingData = {
      id: ratingId,
      gameId,
      userId: user.id,
      rating,
      review: review || '',
      createdAt: new Date().toISOString(),
    };

    await kv.set(ratingId, ratingData);

    // Update game's average rating
    await updateGameRating(gameId);

    return c.json({ success: true, rating: ratingData });
  } catch (error) {
    console.log('Rate game error:', error);
    return c.json({ error: 'Internal server error while rating game' }, 500);
  }
});

// Get ratings for a game
app.get('/make-server-b33c7dce/games/:gameId/ratings', async (c) => {
  try {
    const gameId = c.req.param('gameId');
    const allRatings = await kv.getByPrefix(`rating:${gameId}:`);
    
    // Sort by date
    allRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Attach user data
    const ratingsWithUsers = await Promise.all(
      allRatings.map(async (rating: any) => {
        const userData = await kv.get(`user:${rating.userId}`);
        return {
          ...rating,
          user: userData ? {
            name: userData.name,
            avatar: userData.avatar,
            level: userData.level,
          } : null,
        };
      })
    );

    // Calculate average
    const average = allRatings.length > 0
      ? allRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / allRatings.length
      : 0;

    return c.json({ 
      ratings: ratingsWithUsers,
      average: Math.round(average * 10) / 10,
      count: allRatings.length,
    });
  } catch (error) {
    console.log('Get ratings error:', error);
    return c.json({ error: 'Internal server error while fetching ratings' }, 500);
  }
});

// Helper function to update game rating
async function updateGameRating(gameId: string) {
  try {
    const allRatings = await kv.getByPrefix(`rating:${gameId}:`);
    
    if (allRatings.length === 0) {
      return;
    }

    const average = allRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / allRatings.length;
    
    // Store game rating stats
    await kv.set(`game:${gameId}:rating`, {
      average: Math.round(average * 10) / 10,
      count: allRatings.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.log('Update game rating error:', error);
  }
}

// ==================== EVENTS/TOURNAMENTS ====================

// Create an event
app.post('/make-server-b33c7dce/events', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { title, description, game, type, startDate, endDate, maxParticipants, prize } = await c.req.json();

    if (!title || !game || !type || !startDate) {
      return c.json({ error: 'Title, game, type, and start date are required' }, 400);
    }

    const eventId = `event:${Date.now()}:${user.id}`;
    const event = {
      id: eventId,
      creatorId: user.id,
      title,
      description: description || '',
      game,
      type, // 'tournament', 'casual', 'practice'
      startDate,
      endDate: endDate || null,
      maxParticipants: maxParticipants || null,
      prize: prize || '',
      participants: [],
      status: 'upcoming', // upcoming, ongoing, completed, cancelled
      createdAt: new Date().toISOString(),
    };

    await kv.set(eventId, event);

    return c.json({ success: true, event });
  } catch (error) {
    console.log('Create event error:', error);
    return c.json({ error: 'Internal server error while creating event' }, 500);
  }
});

// Get all events
app.get('/make-server-b33c7dce/events', async (c) => {
  try {
    const status = c.req.query('status') || 'all';
    const allEvents = await kv.getByPrefix('event:');
    
    let events = allEvents;
    if (status !== 'all') {
      events = events.filter((event: any) => event.status === status);
    }

    // Sort by start date
    events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Attach creator data
    const eventsWithCreators = await Promise.all(
      events.map(async (event: any) => {
        const creator = await kv.get(`user:${event.creatorId}`);
        return {
          ...event,
          creator: creator ? {
            name: creator.name,
            avatar: creator.avatar,
          } : null,
        };
      })
    );

    return c.json({ events: eventsWithCreators });
  } catch (error) {
    console.log('Get events error:', error);
    return c.json({ error: 'Internal server error while fetching events' }, 500);
  }
});

// Join an event
app.post('/make-server-b33c7dce/events/:eventId/join', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('eventId');
    const event = await kv.get(eventId);

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    if (event.status !== 'upcoming') {
      return c.json({ error: 'Cannot join this event' }, 400);
    }

    if (event.participants.includes(user.id)) {
      return c.json({ error: 'Already joined this event' }, 400);
    }

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return c.json({ error: 'Event is full' }, 400);
    }

    event.participants.push(user.id);
    await kv.set(eventId, event);

    return c.json({ success: true, event });
  } catch (error) {
    console.log('Join event error:', error);
    return c.json({ error: 'Internal server error while joining event' }, 500);
  }
});

// Leave an event
app.post('/make-server-b33c7dce/events/:eventId/leave', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('eventId');
    const event = await kv.get(eventId);

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const index = event.participants.indexOf(user.id);
    if (index === -1) {
      return c.json({ error: 'Not a participant in this event' }, 400);
    }

    event.participants.splice(index, 1);
    await kv.set(eventId, event);

    return c.json({ success: true, event });
  } catch (error) {
    console.log('Leave event error:', error);
    return c.json({ error: 'Internal server error while leaving event' }, 500);
  }
});

// ==================== GLOBAL SEARCH ====================

// Global search (users, posts, games)
app.get('/make-server-b33c7dce/search', async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    const type = c.req.query('type') || 'all'; // 'all', 'users', 'posts', 'games'

    if (!query || query.length < 2) {
      return c.json({ 
        users: [],
        posts: [],
        games: [],
      });
    }

    const results: any = {
      users: [],
      posts: [],
      games: [],
    };

    // Search users
    if (type === 'all' || type === 'users') {
      const allUsers = await kv.getByPrefix('user:');
      results.users = allUsers.filter((user: any) => 
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      ).slice(0, 10).map((user: any) => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
      }));
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const allPosts = await kv.getByPrefix('post:');
      const matchingPosts = allPosts.filter((post: any) => 
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.gameName?.toLowerCase().includes(query)
      ).slice(0, 10);

      results.posts = await Promise.all(
        matchingPosts.map(async (post: any) => {
          const author = await kv.get(`user:${post.userId}`);
          return {
            id: post.id,
            title: post.title,
            gameName: post.gameName,
            likes: post.likes,
            comments: post.comments,
            createdAt: post.createdAt,
            author: author ? {
              name: author.name,
              avatar: author.avatar,
            } : null,
          };
        })
      );
    }

    // Search games
    if (type === 'all' || type === 'games') {
      const allGames = await kv.getByPrefix('game:');
      results.games = allGames.filter((game: any) => 
        game.name?.toLowerCase().includes(query) ||
        game.genre?.toLowerCase().includes(query)
      ).slice(0, 10);
    }

    return c.json(results);
  } catch (error) {
    console.log('Search error:', error);
    return c.json({ error: 'Internal server error while searching' }, 500);
  }
});

Deno.serve(app.fetch);