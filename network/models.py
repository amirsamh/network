from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    likes = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "creator": self.creator.username,
            "creator_id": self.creator.id, 
            "text": self.text,
            "likes": self.likes,
            "timestamp": self.timestamp,
            "id": self.id
        }
    
    def __str__(self):
        return f"Post {self.id} by {self.creator}"
    
class Like(models.Model):
    post = models.ForeignKey(Post, related_name="liked_post", on_delete=models.CASCADE)
    liker = models.ForeignKey(User, related_name="liker", on_delete=models.CASCADE)

class Following(models.Model):
    user_id = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE, null=True, blank=True)
    following = models.ForeignKey(User, related_name="followers", on_delete=models.CASCADE, null=True, blank=True)