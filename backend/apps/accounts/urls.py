from django.urls import path
from . import views

from django.urls import path
from . import views

urlpatterns = [
    # Auth & Tokens
    path('csrf-token/', views.csrf_token, name='csrf_token'),
    path('user_login/', views.user_login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('signup/', views.sign_up, name='signup'),
    path('google_login/', views.google_login, name='google_login'),

    # User Profile Data
    path('user/', views.user, name='user'),
    path('profile/', views.profile, name='profile'),
    path('update_profile/', views.update_profile, name='update_profile'),

    # Profile Pictures
    path('upload_profile_picture/', views.upload_profile_picture, name='upload_profile_picture'),
    path('delete_profile_picture/', views.delete_profile_picture, name='delete_profile_picture'),

    # --- UNIFIED PULSE SYSTEM ---
    path('add_pulse/', views.add_pulse, name='add_pulse'),
    path('remove_pulse/<int:pulse_id>/', views.remove_pulse, name='remove_pulse'),
    path('get_pulses/', views.get_pulses, name='get_pulses'),

    # Search & Social
    path("search-users/", views.search_users, name="search-users"),
    path("follow/<int:user_id>/", views.follow_user, name="follow_user"),
    path("unfollow/<int:user_id>/", views.unfollow_user, name="unfollow_user"),
    path("follow-requests/", views.get_follow_requests, name="get_follow_requests"),
    path("follow-requests/accept/<int:request_id>/", views.accept_follow_request, name="accept_follow_request"),
    path("follow-requests/reject/<int:request_id>/", views.reject_follow_request, name="reject_follow_request"),
]