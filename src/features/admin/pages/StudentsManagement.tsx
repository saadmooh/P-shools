import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, QrCode, Search, ShieldX, Pencil, Trash2, X, Save, UserPlus, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { studentsService } from '../../../services/supabase/students';
import { useTelegram } from '../../../hooks/useTelegram';
import { useAuthPermissions, PERMISSIONS } from '../../../lib/permissions';

const StudentsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const { hasPermission, isAdmin } = useAuthPermissions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentFormData, setStudentFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    guardian_id: '', // Assuming guardians will be linked, might need a lookup
  });
  const [canManageStudents, setCanManageStudents] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = await hasPermission(PERMISSIONS.STUDENTS_MANAGE) || isAdmin();
      setCanManageStudents(hasAccess);
    };
    checkPermissions();
  }, [hasPermission, isAdmin]);

  // Show access denied if user doesn't have permission
  if (!canManageStudents) {
    return (
      <Layout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <ShieldX size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
          <p className="text-zinc-600 mb-6 max-w-md">
            You don't have permission to manage students.
            Contact your administrator if you need access.
          </p>
          <Button onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', searchTerm],
    queryFn: async () => {
      // Using studentsService to fetch data
      const fetchedStudents = await studentsService.getAll();
      if (searchTerm) {
        return fetchedStudents.filter(student => 
          student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return fetchedStudents;
    }
  });

  // Mutations for CRUD operations
  const createStudentMutation = useMutation({
    mutationFn: studentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsAdding(false);
      setStudentFormData({ full_name: '', email: '', phone: '', guardian_id: '' });
      hapticFeedback('light');
    },
    onError: (error: any) => {
      console.error("Failed to create student:", error);
      alert(\`Failed to add student: \${error.message}\`);
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => studentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditing(false);
      setSelectedStudent(null);
      setStudentFormData({ full_name: '', email: '', phone: '', guardian_id: '' });
      hapticFeedback('medium');
    },
    onError: (error: any) => {
      console.error("Failed to update student:", error);
      alert(\`Failed to update student: \${error.message}\`);
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => studentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDeleting(false);
      setSelectedStudent(null);
      hapticFeedback('medium');
    },
    onError: (error: any) => {
      console.error("Failed to delete student:", error);
      alert(\`Failed to delete student: \${error.message}\`);
    }
  });

  const handleSaveStudent = () => {
    if (!studentFormData.full_name) {
      alert("Student name is required.");
      return;
    }
    if (isEditing && selectedStudent) {
      updateStudentMutation.mutate({ id: selectedStudent.id, data: studentFormData });
    } else {
      createStudentMutation.mutate(studentFormData);
    }
  };

  const startEdit = (student: any) => {
    setSelectedStudent(student);
    setStudentFormData({
      full_name: student.full_name,
      email: student.email || '',
      phone: student.phone || '',
      guardian_id: student.guardian_id || '',
    });
    setIsEditing(true);
  };
  
  const startDelete = (student: any) => {
    setSelectedStudent(student);
    setIsDeleting(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setIsDeleting(false);
    setSelectedStudent(null);
    setStudentFormData({ full_name: '', email: '', phone: '', guardian_id: '' });
  };

  return (
    <Layout title="Manage Students">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="relative flex-1">
          <Input 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 text-[var(--tg-theme-hint-color)]" size={18} />
        </div>
        {canManageStudents && ( // Only show Add button if user can manage students
          <Button size="sm" className="p-2" onClick={() => { setIsAdding(true); setSelectedStudent(null); setStudentFormData({ full_name: '', email: '', phone: '', guardian_id: '' }); }}>
            <Plus size={20} /> Add Student
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading students...</div>
      ) : students?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <QrCode size={24} className="text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">No Students Found</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Students will appear here once they're enrolled in the system.
          </p>
          {canManageStudents && ( // Show add button even if list is empty
            <Button size="sm" onClick={() => { setIsAdding(true); setSelectedStudent(null); setStudentFormData({ full_name: '', email: '', phone: '', guardian_id: '' }); }}>
              Add First Student
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {students?.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center">
                    <User size={20} className="text-[var(--tg-theme-hint-color)]" />
                  </div>
                  <div>
                    <h4 className="font-bold">{student.full_name}</h4>
                    <p className="text-xs text-[var(--tg-theme-hint-color)]">
                      Guardian: {student.guardians?.full_name || 'N/A'}
                    </p>
                    <p className="text-xs text-[var(--tg-theme-hint-color)]">
                      Student ID: {student.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {canManageStudents && (
                    <>
                      <Button variant="ghost" size="sm" className="p-2" onClick={() => startEdit(student)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2 text-[var(--tg-theme-destructive-text-color)]" onClick={() => startDelete(student)}>
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="p-2" onClick={() => {
                    setSelectedStudent(student);
                    hapticFeedback('light');
                  }}>
                    <QrCode size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{isEditing ? 'Edit Student' : 'Add New Student'}</h3>
                <Button variant="ghost" size="sm" className="p-2" onClick={handleCancel}>
                  <X size={20} />
                </Button>
              </div>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  value={studentFormData.full_name}
                  onChange={(e) => setStudentFormData({...studentFormData, full_name: e.target.value})}
                />
                <Input
                  label="Email"
                  placeholder="e.g. john.doe@example.com"
                  value={studentFormData.email}
                  onChange={(e) => setStudentFormData({...studentFormData, email: e.target.value})}
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g. +1234567890"
                  value={studentFormData.phone}
                  onChange={(e) => setStudentFormData({...studentFormData, phone: e.target.value})}
                />
                {/* TODO: Implement Guardian selection */}
                {/* <Select label="Guardian" value={studentFormData.guardian_id} onChange={(e) => setStudentFormData({...studentFormData, guardian_id: e.target.value})}>
                  <option value="">Select Guardian</option>
                </Select> */}
                <Button onClick={handleSaveStudent} loading={createStudentMutation.isPending || updateStudentMutation.isPending} className="w-full">
                  {isEditing ? 'Update Student' : 'Add Student'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-xs animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 text-center">
              <ShieldX size={48} className="text-red-500 mb-4 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Delete Student</h3>
              <p className="text-sm text-[var(--tg-theme-hint-color)] mb-4">
                Are you sure you want to delete {selectedStudent.full_name}? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancel} className="flex-1">Cancel</Button>
                <Button variant="destructive" onClick={() => deleteStudentMutation.mutate(selectedStudent.id)} loading={deleteStudentMutation.isPending} className="flex-1">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Code Modal Overlay */}
      {selectedStudent && !isEditing && !isDeleting && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedStudent(null)}
        >
          <Card className="w-full max-w-xs animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full">
                <h3 className="font-bold text-lg">{selectedStudent.full_name}</h3>
                <Button variant="ghost" size="sm" className="p-2" onClick={() => setSelectedStudent(null)}>
                  <X size={20} />
                </Button>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <QRCode 
                  value={selectedStudent.id} 
                  size={200}
                  level="H"
                />
              </div>
              <p className="text-xs text-[var(--tg-theme-hint-color)] text-center">
                Student Code: {selectedStudent.id.slice(0, 8)}
              </p>
              <Button className="w-full" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default StudentsManagement;

