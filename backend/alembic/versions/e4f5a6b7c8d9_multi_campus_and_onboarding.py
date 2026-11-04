"""multi_campus_and_onboarding

Revision ID: e4f5a6b7c8d9
Revises: 823797e52d3c
Create Date: 2026-11-03 22:15:00.000000

"""
from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e4f5a6b7c8d9'
down_revision: Union[str, None] = '823797e52d3c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    try:
        insp = sa.inspect(bind)
        existing_campus_cols = [c['name'] for c in insp.get_columns('campuses')] if insp else []
        existing_user_cols = [c['name'] for c in insp.get_columns('users')] if insp else []
        tables = insp.get_table_names() if insp else []
    except Exception:
        existing_campus_cols = []
        existing_user_cols = []
        tables = []

    # 1. Add fields to campuses table if not already added
    campus_new_cols = [
        ('institution_name', sa.String()),
        ('institution_type', sa.String()),
        ('code', sa.String()),
        ('city', sa.String()),
        ('state', sa.String()),
        ('country', sa.String()),
        ('student_count', sa.Integer()),
        ('faculty_count', sa.Integer()),
        ('staff_count', sa.Integer()),
        ('campus_area_acres', sa.Float()),
        ('built_up_area_sq_m', sa.Float()),
        ('building_count', sa.Integer()),
        ('academic_year', sa.String()),
        ('baseline_year', sa.String()),
    ]
    with op.batch_alter_table('campuses') as batch_op:
        for col_name, col_type in campus_new_cols:
            if col_name not in existing_campus_cols:
                batch_op.add_column(sa.Column(col_name, col_type, nullable=True))

    # 2. Add campus_id to users table if not already added
    if 'campus_id' not in existing_user_cols:
        with op.batch_alter_table('users') as batch_op:
            batch_op.add_column(sa.Column('campus_id', sa.String(), nullable=True))
            batch_op.create_foreign_key('fk_users_campus_id', 'campuses', ['campus_id'], ['id'])

    # Populate existing users with campus-mlrit-01 if null

    # 3. Create invitations table if not exists
    if 'invitations' not in tables:
        op.create_table(
            'invitations',
            sa.Column('id', sa.String(), primary_key=True),
            sa.Column('campus_id', sa.String(), sa.ForeignKey('campuses.id', name='fk_invitations_campus_id'), nullable=False),
            sa.Column('email', sa.String(), nullable=False),
            sa.Column('role', sa.String(), nullable=False, server_default='VIEWER'),
            sa.Column('token', sa.String(), nullable=False),
            sa.Column('invited_by_user_id', sa.String(), sa.ForeignKey('users.id', name='fk_invitations_user_id'), nullable=True),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('is_accepted', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        )
        op.create_index(op.f('ix_invitations_email'), 'invitations', ['email'], unique=False)
        op.create_index(op.f('ix_invitations_token'), 'invitations', ['token'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_invitations_token'), table_name='invitations')
    op.drop_index(op.f('ix_invitations_email'), table_name='invitations')
    op.drop_table('invitations')

    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_constraint('fk_users_campus_id', type_='foreignkey')
        batch_op.drop_column('campus_id')

    with op.batch_alter_table('campuses') as batch_op:
        for col in [
            'baseline_year', 'academic_year', 'building_count', 'built_up_area_sq_m',
            'campus_area_acres', 'staff_count', 'faculty_count', 'student_count',
            'country', 'state', 'city', 'code', 'institution_type', 'institution_name'
        ]:
            batch_op.drop_column(col)
