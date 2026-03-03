from django.contrib import admin
from .models import User, Skill, UserObject, Follow, Friendship, PendingFollow, Group_Conversation, DirectConversation

# Register your models here.

admin.site.register(User)
admin.site.register(Skill)
admin.site.register(UserObject)
admin.site.register(Follow)
admin.site.register(Friendship)
admin.site.register(PendingFollow)
admin.site.register(Group_Conversation)
admin.site.register(DirectConversation)