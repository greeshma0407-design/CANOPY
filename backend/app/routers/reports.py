"""Reports router with multi-campus tenant isolation and RBAC."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.core.dependencies import require_any_authenticated, require_manager_or_admin
from app.database import get_db
from app.models.user import User
from app.schemas.report import ReportCreate, ReportRead
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportRead, status_code=201)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Generate a fresh inventory report for current user's campus."""
    if current_user.campus_id:
        payload.campus_id = current_user.campus_id
    return report_service.create_report(db, payload)


@router.get("/{report_id}", response_model=ReportRead)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Get report details strictly scoped to current user's campus."""
    report = report_service.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if current_user.campus_id and report.campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access reports from another campus.",
        )
    return report


@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Download report CSV file with tenant isolation check."""
    report = report_service.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if current_user.campus_id and report.campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access reports from another campus.",
        )

    if report.status != "ready":
        raise HTTPException(status_code=400, detail=f"Report not ready (status={report.status})")

    csv_content = report_service.get_csv_content(report_id)
    if csv_content is None:
        raise HTTPException(status_code=404, detail="Report file not found")

    return PlainTextResponse(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{report_id}.csv"'},
    )
