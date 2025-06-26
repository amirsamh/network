from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post, Like, Following
from django.core.paginator import Paginator, EmptyPage
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json


def index(request):
    return render(request, "network/index.html")

@login_required(login_url='login')
def follow(request, following_id):
    if request.user.id == following_id:
        return JsonResponse({'error': 'you cannot follow/unfollow your own profile'})
    else:
        try:
            following_object = Following.objects.get(user_id=request.user.id, following=following_id)
            return JsonResponse({'error': 'already followed', 'followed': True, 'followers': Following.objects.filter(following=User.objects.get(id=following_id)).count(), 'followings': Following.objects.filter(user_id=User.objects.get(id=following_id)).count()}, status=400)
        except Following.DoesNotExist:
            following = Following()
            following.user_id = User.objects.get(id=request.user.id)
            following.following = User.objects.get(id=following_id)
            following.save()
            return JsonResponse({'success': 'successfully followed', 'followed': True, 'followers': Following.objects.filter(following=User.objects.get(id=following_id)).count(), 'followings': Following.objects.filter(user_id=User.objects.get(id=following_id)).count()}, status=200)

@login_required(login_url='login')
def unfollow(request, following_id):
    if request.user.id == following_id:
        return JsonResponse(request, {'error': 'you cannot follow/unfollow your own profile'})
    else:
        try:
            Following.objects.get(user_id=request.user.id, following=following_id).delete()
            return JsonResponse({'success': 'successfully unfollowed', 'followed': False, 'followers': Following.objects.filter(following=User.objects.get(id=following_id)).count(), 'followings': Following.objects.filter(user_id=User.objects.get(id=following_id)).count()}, status=200)
        except Following.DoesNotExist:
            return JsonResponse({'error': 'already unfollowed', 'followed': False, 'followers': Following.objects.filter(following=User.objects.get(id=following_id)).count(), 'followings': Following.objects.filter(user_id=User.objects.get(id=following_id)).count()}, status=200)

def load_profile(request, username, page_number):
    try:
        if request.user.is_authenticated:
            try:
                following_obj = Following.objects.get(user_id=request.user.id, following=User.objects.get(username=username))
                following = True
            except Following.DoesNotExist:
                following = False

            try:
                followers_count = Following.objects.filter(following=User.objects.get(username=username)).count()
            except Following.DoesNotExist:
                followers_count = 0

            try:
                followings_count = Following.objects.filter(user_id=User.objects.get(username=username)).count()
            except Following.DoesNotExist:
                followings_count = 0

            creator_id = User.objects.get(username=username).id
            data = Post.objects.filter(creator=creator_id).order_by("-timestamp")
            posts = []
            for post in data:
                post_data = post.serialize()
                liked_by_user = Like.objects.filter(liker=request.user.id, post=post_data['id'])
                all_likes = Like.objects.filter(post=post_data['id']).count()
                if liked_by_user:
                    post_data.update({'liked': True, 'likes': all_likes})
                    posts.append(post_data)
                else:
                    post_data.update({'liked': False, 'likes': all_likes})
                    posts.append(post_data)

                if post_data['creator_id'] == request.user.id:
                    post_data.update({'editable': True})
                else:
                    post_data.update({'editable': False})

            p = Paginator(posts, 10)
            return JsonResponse([{'page_num': f'{p.num_pages}', 'following': following, 'visitor': User.objects.get(id=request.user.id).username, 'followers_count': followers_count, 'followings_count': followings_count}] + list(p.page(page_number)), status=200, safe=False)
        else:
            try:
                followers_count = Following.objects.filter(following=User.objects.get(username=username)).count()
            except Following.DoesNotExist:
                followers_count = 0

            try:
                followings_count = Following.objects.filter(user_id=User.objects.get(username=username)).count()
            except Following.DoesNotExist:
                followings_count = 0

            creator_id = User.objects.get(username=username).id
            data = Post.objects.filter(creator=creator_id).order_by("-timestamp")
            posts = []
            for post in data:
                post_data = post.serialize()
                liked_by_user = Like.objects.filter(liker=request.user.id, post=post_data['id'])
                all_likes = Like.objects.filter(post=post_data['id']).count()
                if liked_by_user:
                    post_data.update({'liked': True, 'likes': all_likes})
                    posts.append(post_data)
                else:
                    post_data.update({'liked': False, 'likes': all_likes})
                    posts.append(post_data)

                post_data.update({'editable': False})
            p = Paginator(posts, 10)
            return JsonResponse([{'page_num': f'{p.num_pages}', 'following': False, 'visitor': False, 'followers_count': followers_count, 'followings_count': followings_count}] + list(p.page(page_number)), status=200, safe=False)
    except EmptyPage:
        return JsonResponse({'error': 'page does not exist.'})

@login_required(login_url='login')
def following(request, page_number):
    try:
        followings_data = Following.objects.filter(user_id=User.objects.get(id=request.user.id)).values()
        followings = []
        for following in followings_data:
            followings.append(following['following_id'])

        data = Post.objects.filter(creator_id__in = followings).order_by("-timestamp")
        posts = []
        for post in data:
            post_data = post.serialize()
            liked_by_user = Like.objects.filter(liker=request.user.id, post=post_data['id'])
            all_likes = Like.objects.filter(post=post_data['id']).count()
            if liked_by_user:
                post_data.update({'liked': True, 'likes': all_likes})
                posts.append(post_data)
            else:
                post_data.update({'liked': False, 'likes': all_likes})
                posts.append(post_data)

            if post_data['creator_id'] == request.user.id:
                post_data.update({'editable': True})
            else:
                post_data.update({'editable': False})

        p = Paginator(posts, 10)
        return JsonResponse([{'page_num': f'{p.num_pages}', 'visitor': User.objects.get(id=request.user.id).username}] + list(p.page(page_number)), status=200, safe=False)
    except EmptyPage:
        return JsonResponse({'error': 'page does not exist.'})

@csrf_exempt
@login_required(login_url='login')
def edit(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        id = data['id']
        text = data['text']
        if request.user.id == Post.objects.get(id=id).creator_id:
            try:
                Post.objects.filter(id=id).update(text=text)
                return JsonResponse({'success': 'successfully edited post', 'text': text}, status=200)
            except Post.DoesNotExist:
                return JsonResponse({'error': 'post does not exist'}, status=400)
        else:
            return JsonResponse({'error': 'access denied'}, status=400)

@login_required(login_url='login')
def new(request):
    if request.method == 'POST':
        if len(request.POST.get("text")) > 0:
            post = Post()
            post.text = request.POST["text"]
            post.creator = request.user
            post.save()

            return render(request, "network/new.html", {
                'message': 'Successfully created post.'
            })

    return render(request, "network/new.html")

def load(request, page_number):
    try:
        data = Post.objects.order_by('-timestamp').all()
        posts = []
        for post in data:
            post_data = post.serialize()
            liked_by_user = Like.objects.filter(liker=request.user.id, post=post_data['id'])
            all_likes = Like.objects.filter(post=post_data['id']).count()
            if liked_by_user:
                post_data.update({'liked': True, 'likes': all_likes})
                posts.append(post_data)
            else:
                post_data.update({'liked': False, 'likes': all_likes})
                posts.append(post_data)

            if post_data['creator_id'] == request.user.id:
                post_data.update({'editable': True})
            else:
                post_data.update({'editable': False})

        p = Paginator(posts, 10)
        return JsonResponse([{'page_num': f'{p.num_pages}'}] + list(p.page(page_number)), status=200, safe=False)
    except EmptyPage:
        return JsonResponse({'error': 'page does not exist.'})

@login_required(login_url='login')
def like(request, id):
    if request.user.is_authenticated:
        if not Like.objects.filter(liker=request.user.id, post=id):
            try:
                like = Like()
                like.post = Post.objects.get(pk=id)
                like.liker = User.objects.get(pk=request.user.id)
                like.save()
                like_count = Like.objects.filter(post=Post.objects.get(pk=id)).count()
                Post.objects.filter(pk=id).update(likes=like_count)
                return JsonResponse({'success': 'successfully liked the post', 'likes': like_count})
            except Post.DoesNotExist:
                return JsonResponse({'error': 'not found'})
        else:
            return JsonResponse({'error': 'already liked'})
    else:
        HttpResponseRedirect('login')

@login_required(login_url='login')    
def unlike(request, id):
    if Like.objects.filter(liker=request.user.id, post=id):
        try:
            Like.objects.get(liker=request.user.id, post=id).delete()
            return JsonResponse({'success': 'successfully unliked the post', 'likes': Like.objects.filter(post=Post.objects.get(pk=id)).count()})
        except Like.DoesNotExist:
            return JsonResponse({'error': 'not found'})
    else:
        return JsonResponse({'error': 'already unliked'})

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")