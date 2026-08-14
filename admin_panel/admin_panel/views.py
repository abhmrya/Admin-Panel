from django.shortcuts import render
from django.views.generic import TemplateView

class ForbiddenViewPage(TemplateView):

    template_name = "forbidden.html"