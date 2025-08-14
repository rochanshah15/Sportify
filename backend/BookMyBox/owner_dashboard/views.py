# owner_dashboard/views.py

from collections import defaultdict
from datetime import timedelta

from django.db import models
from django.db.models import Avg, Count, DecimalField, FloatField, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from boxes.models import Box

from .serializers import OwnerDashboardStatsSerializer


class OwnerDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        all_owner_boxes = Box.objects.filter(owner=user).order_by("-submitted_at")
        approved_boxes = all_owner_boxes.filter(status="approved")

        # Key Metrics
        stats = approved_boxes.aggregate(
            total_revenue=Coalesce(
                Sum("bookings__total_amount", filter=models.Q(bookings__booking_status="completed")),
                0.0,
                output_field=DecimalField(),
            ),
            total_bookings=Coalesce(Count("bookings"), 0),
            avg_rating=Coalesce(Avg("reviews__rating"), 0.0, output_field=FloatField()),
        )

        # Box Status Counts
        box_counts = all_owner_boxes.aggregate(
            pending_boxes=Count("id", filter=models.Q(status="pending")),
            rejected_boxes=Count("id", filter=models.Q(status="rejected")),
        )

        # Chart Data
        sports_count = defaultdict(int)
        for box in all_owner_boxes.only("sports"):
            for sport in box.sports:
                sports_count[sport] += 1

        today = timezone.now().date()
        revenue_chart_labels = []
        revenue_chart_data = []
        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            revenue_chart_labels.append(month_start.strftime("%b"))
            monthly_revenue = (
                Booking.objects.filter(
                    box__in=approved_boxes,
                    date__month=month_start.month,
                    date__year=month_start.year,
                    booking_status="completed",
                ).aggregate(total=Coalesce(Sum("total_amount"), 0.0, output_field=DecimalField()))["total"]
            )
            revenue_chart_data.append(monthly_revenue)

        # --- Recent Bookings ---
        # --- MODIFIED: Changed '-time_slot' to '-start_time' ---
        recent_bookings_qs = (
            Booking.objects.filter(box__in=all_owner_boxes)
            .select_related("user", "box")
            .order_by("-date", "-start_time")[:5]
        )
        
        # --- MODIFIED: Create a useful time_slot string from start_time and end_time ---
        recent_bookings_data = [
            {
                "id": b.id,
                "user_name": b.user.name if b.user else "N/A",
                "box_name": b.box.name if b.box else "N/A",
                "date": b.date,
                "amount": b.total_amount,
                "status": b.booking_status,
                "time_slot": f"{b.start_time.strftime('%H:%M')} - {b.end_time.strftime('%H:%M')}"
            }
            for b in recent_bookings_qs
        ]

        # Compile Final Data
        data = {
            "total_revenue": stats["total_revenue"],
            "total_bookings": stats["total_bookings"],
            "active_boxes_count": approved_boxes.count(),
            "pending_boxes_count": box_counts["pending_boxes"],
            "rejected_boxes_count": box_counts["rejected_boxes"],
            "avg_rating": round(stats["avg_rating"], 1),
            "sports_distribution": dict(sports_count),
            "revenue_chart_labels": revenue_chart_labels,
            "revenue_chart_data": revenue_chart_data,
            "recent_bookings": recent_bookings_data,
            "all_owner_boxes": all_owner_boxes,
            "bookings_chart_labels": [],
            "bookings_chart_data": [],
        }

        serializer = OwnerDashboardStatsSerializer(instance=data)
        return Response(serializer.data)