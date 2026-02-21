import React from 'react';
import NotesSection from '../Components/NotesSection';

export default function CourseVaultPage({
  courses,
  setCourses,
  activeCourseId,
  setActiveCourseId,
}) {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Course Vault</h1>
      <p style={subStyle}>Courses, modules, notes, and files.</p>
      <NotesSection
        courses={courses || []}
        setCourses={setCourses || (() => {})}
        activeCourseId={activeCourseId}
        setActiveCourseId={setActiveCourseId ?? (() => {})}
      />
    </div>
  );
}

const pageStyle = { padding: '24px', margin: '0 auto', minHeight: '60vh' };
const titleStyle = { fontSize: '24px', fontWeight: '700', marginBottom: '6px' };
const subStyle = { color: 'var(--text-secondary)', marginBottom: '20px' };
