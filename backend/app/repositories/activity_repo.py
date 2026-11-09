"""Activity repository."""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.activity import ActivityRecord, ActivityItem
from app.schemas.activity import ActivityRecordCreate, ActivityRecordUpdate
import json


class ActivityRepository:

    def create(self, db: Session, data: ActivityRecordCreate) -> ActivityRecord:
        record = ActivityRecord(
            campus_id=data.campus_id,
            reporting_period_id=data.reporting_period_id,
            category=data.category,
            status=data.status,
            notes=data.notes,
            data_source=data.data_source,
        )
        db.add(record)
        db.flush()

        for item_data in data.items:
            meta = json.dumps(item_data.metadata_json) if item_data.metadata_json else None
            item = ActivityItem(
                activity_record_id=record.id,
                activity_type=item_data.activity_type,
                quantity=item_data.quantity,
                unit=item_data.unit,
                subcategory=item_data.subcategory,
                metadata_json=meta,
                factor_id=item_data.factor_id,
            )
            db.add(item)

        db.commit()
        db.refresh(record)
        return record

    def get(self, db: Session, record_id: str) -> Optional[ActivityRecord]:
        return db.query(ActivityRecord).filter(ActivityRecord.id == record_id).first()

    def update(
        self,
        db: Session,
        record_id: str,
        data: ActivityRecordUpdate,
    ) -> Optional[ActivityRecord]:
        record = self.get(db, record_id)
        if not record:
            return None

        if data.category is not None:
            record.category = data.category
        if data.status is not None:
            record.status = data.status
        if data.notes is not None:
            record.notes = data.notes
        if data.data_source is not None:
            record.data_source = data.data_source

        if data.items is not None:
            # Replace child items
            db.query(ActivityItem).filter(ActivityItem.activity_record_id == record_id).delete()
            for item_data in data.items:
                meta = json.dumps(item_data.metadata_json) if item_data.metadata_json else None
                item = ActivityItem(
                    activity_record_id=record.id,
                    activity_type=item_data.activity_type,
                    quantity=item_data.quantity,
                    unit=item_data.unit,
                    subcategory=item_data.subcategory,
                    metadata_json=meta,
                    factor_id=item_data.factor_id,
                )
                db.add(item)

        db.commit()
        db.refresh(record)
        return record

    def delete(self, db: Session, record_id: str) -> bool:
        record = self.get(db, record_id)
        if not record:
            return False
        db.delete(record)
        db.commit()
        return True

    def list(
        self,
        db: Session,
        campus_id: Optional[str] = None,
        period_id: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[ActivityRecord]:
        q = db.query(ActivityRecord)
        if campus_id:
            q = q.filter(ActivityRecord.campus_id == campus_id)
        if period_id:
            target_ids = [period_id]
            if period_id == "period-2025":
                target_ids.append("period-cy2025-01")
            elif period_id == "period-cy2025-01":
                target_ids.append("period-2025")
            q = q.filter(ActivityRecord.reporting_period_id.in_(target_ids))
        if category:
            q = q.filter(ActivityRecord.category == category)
        return q.all()


activity_repo = ActivityRepository()
