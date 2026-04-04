import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../shared/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Book, Compass, Clock, CreditCard } from 'lucide-react';
import Button from '../../../components/ui/Button';

const IndependentDashboard: React.FC = () => {
  const { t } = useTranslation();

  const courses = [
    { name: 'Full Stack Web Dev', progress: 65, nextSession: 'Tomorrow, 10:00' },
    { name: 'UI/UX Design', progress: 30, nextSession: 'Monday, 14:00' },
  ];

  return (
    <Layout title={t('dashboards.independent_title')}>
      <Card className="mb-6 bg-gradient-to-br from-purple-500 to-violet-600 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-violet-100 text-sm">Learning Progress</p>
              <h2 className="text-3xl font-bold">2 Active</h2>
            </div>
            <Book size={40} className="text-white opacity-40" />
          </div>
          <Button variant="secondary" className="w-full bg-white text-violet-600 border-none">
            Browse New Courses
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">My Courses</h3>
        {courses.map((course, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">{course.name}</h4>
                <span className="text-xs font-bold text-[var(--tg-theme-button-color)]">{course.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--tg-theme-secondary-bg-color)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--tg-theme-button-color)] rounded-full transition-all" 
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--tg-theme-hint-color)]">
                <Clock size={12} />
                <span>Next: {course.nextSession}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold mb-3">Recommendations</h3>
        <Card className="bg-[var(--tg-theme-secondary-bg-color)] border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Compass className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Advanced React Patterns</h4>
              <p className="text-xs text-[var(--tg-theme-hint-color)]">Based on your interests</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default IndependentDashboard;
