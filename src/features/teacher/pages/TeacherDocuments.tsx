import React from 'react';
import { FileText, Download, DollarSign } from 'lucide-react';

const TeacherDocuments: React.FC = () => {
  // Placeholder data
  const documents = [
    { id: 1, title: 'Payroll January 2024', type: 'PDF', size: '1.2 MB', amount: '$1200' },
    { id: 2, title: 'Contract 2024', type: 'PDF', size: '2.1 MB' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6" />
        My Documents
      </h1>

      <div className="space-y-4">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {doc.title}
                {doc.amount && <DollarSign className="h-4 w-4 text-green-600" />}
              </h3>
              <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
              {doc.amount && <p className="text-sm text-green-600 font-medium">{doc.amount}</p>}
            </div>
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}

        {documents.length === 0 && (
          <p className="text-gray-500 text-center py-8">No documents available</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDocuments;