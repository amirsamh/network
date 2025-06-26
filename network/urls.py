from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new", views.new, name="new"),
    
    # API Routes
    path("posts/<int:page_number>", views.load, name="load"),
    path("posts/like/<int:id>", views.like, name="like"),
    path("posts/unlike/<int:id>", views.unlike, name="unlike"),
    path("posts/edit", views.edit, name="edit"),
    path("load_profile/<str:username>/<int:page_number>", views.load_profile, name="load_profile"),
    path("follow/<int:following_id>", views.follow, name="follow"),
    path("unfollow/<int:following_id>", views.unfollow, name="unfollow"),
    path("following/<int:page_number>", views.following, name="following")
]