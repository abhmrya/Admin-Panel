from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    LeaveApprovalViewSet,
    LeaveBalanceViewSet,
    LeavePolicyViewSet,
    LeaveRequestViewSet,
    LeaveTypeViewSet,
)
from .views.leave_dashboard_view import (
    LeaveDashboardAPIView,
)


router = DefaultRouter()

router.register(
    "types",
    LeaveTypeViewSet,
    basename="leave-type",
)

router.register(
    "balances",
    LeaveBalanceViewSet,
    basename="leave-balance",
)

router.register(
    "requests",
    LeaveRequestViewSet,
    basename="leave-request",
)

router.register(
    "policies",
    LeavePolicyViewSet,
    basename="leave-policy",
)

router.register(
    "approvals",
    LeaveApprovalViewSet,
    basename="leave-approval",
)


urlpatterns = [
    path(
        "dashboard/",
        LeaveDashboardAPIView.as_view(),
        name="leave-dashboard",
    ),
]

urlpatterns += router.urls