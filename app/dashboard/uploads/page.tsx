'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUser } from '@/lib/auth';
import { listFiles, uploadFile, deleteFile, createFolder, FileData, FolderData } from '@/lib/storage';
import { Folder, File, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"



export default function UploadsPage() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const { user } = useUser();
  const urlPrefix = process.env.NEXT_PUBLIC_S3_URL_PREFIX!;

  if (!user) {
    redirect('/login');
  }

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    const { files, folders } = await listFiles(currentPath);
    setFiles(files);
    setFolders(folders);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileUpload(file);
      await uploadFile(`${currentPath}${file.name}`, file);
      setFileUpload(null);
      fetchFiles();
    }
  };

  const handleDeleteFile = async (key: string) => {
    await deleteFile(key);
    fetchFiles();
  };

  const handleCreateFolder = async () => {
    if (newFolderName) {
      await createFolder(`${currentPath}${newFolderName}/`);
      setNewFolderName('');
      fetchFiles();
    }
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const navigateUp = () => {
    const newPath = currentPath.split('/').slice(0, -2).join('/') + '/';
    setCurrentPath(newPath);
  };

  return (
    <section className="flex-1 p-0 md:p-4">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-white mb-6">
        Uploads
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input type="file" onChange={handleFileUpload} />
              {fileUpload && <p>Uploading: {fileUpload.name}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Folder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Files and Folders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={navigateUp} disabled={currentPath === ''}
              className='bg-zinc-600/50 hover:bg-zinc-600/80'>Up</Button>
            <span className="ml-4">{currentPath || '/'}</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folders.map((folder) => (
                <TableRow key={folder.path}>
                  <TableCell>
                    <Button variant="ghost" onClick={() => navigateToFolder(folder.path)}>
                      <Folder className="mr-2" />
                      {folder.name}
                    </Button>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{folder.lastModified.toLocaleString()}</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              ))}
              {files.map((file) => (
                <TableRow key={file.key}>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger className='flex items-center text-left'>                     
                        {file.isImage ?
                          <img
                            src={`${urlPrefix}/${file.key}`}
                            className="w-6 h-6 mr-2"
                          />
                          :
                          <File className="mr-2" />
                        }
                        {file.key.split('/').pop()}
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>File {file.key.split('/').pop()}</DialogTitle>
                          <DialogDescription>
                            {file.isImage ?
                              <img
                                src={`${urlPrefix}/${file.key}`}
                                className="w-full max-h-1/2 mr-2"
                              />
                              :
                              <File className="mr-2" />
                            }
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>

                  </TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>{file.lastModified.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => handleDeleteFile(file.key)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
