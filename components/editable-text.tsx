"use client";

import { useState, useRef } from "react";
import { Edit2, Save, X, Eye, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { isAdmin } from "@/lib/editable-text";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface EditableTextProps {
  elementId: string;
  pageName: string;
  children?: React.ReactNode;
  className?: string;
  defaultContent?: string;
  contentType?: "html" | "markdown";
}

export function EditableText({
  elementId,
  pageName,
  children,
  className = "",
  defaultContent = "",
  contentType = "html",
}: EditableTextProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(defaultContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userIsAdmin = session?.user?.id
    ? isAdmin(parseInt(session.user.id))
    : false;

  const updateTextMutation = useMutation({
    mutationFn: async (newContent: string) => {
      const response = await fetch("/api/admin/editable-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageName,
          elementId,
          content: newContent,
          modifiedBy: parseInt(session?.user?.id || "0"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["editable-texts", pageName] });
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error saving text:", error);
    },
  });

  const handleEdit = () => {
    setContent(defaultContent);
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          textareaRef.current.scrollHeight + "px";
      }
    }, 0);
  };

  const handleSave = () => {
    if (!session?.user?.id) return;
    updateTextMutation.mutate(content);
  };

  const handleCancel = () => {
    setContent(defaultContent);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
  };

  if (!userIsAdmin) {
    return (
      <div className={className}>
        {contentType === "markdown" ? (
          <div className="markdown-content text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {defaultContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: defaultContent }} />
        )}
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant={isPreviewMode ? "outline" : "default"}
              onClick={() => setIsPreviewMode(false)}
              className="flex items-center gap-1"
            >
              <Code size={14} />
              Editar
            </Button>
            <Button
              size="sm"
              variant={isPreviewMode ? "default" : "outline"}
              onClick={() => setIsPreviewMode(true)}
              className="flex items-center gap-1"
            >
              <Eye size={14} />
              Vista previa
            </Button>
          </div>

          {isPreviewMode ? (
            <div className="min-h-[100px] p-2 border rounded-md bg-gray-50">
              {contentType === "markdown" ? (
                <div className="markdown-content text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[100px] p-2 border rounded-md resize-none font-mono text-sm"
              placeholder={
                contentType === "markdown"
                  ? "Ingrese contenido en Markdown..."
                  : "Ingrese contenido en HTML..."
              }
            />
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateTextMutation.isPending}
              className="flex items-center gap-1"
            >
              <Save size={14} />
              {updateTextMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={updateTextMutation.isPending}
              className="flex items-center gap-1"
            >
              <X size={14} />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className={className}>
            {contentType === "markdown" ? (
              <div className="markdown-content text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {defaultContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: defaultContent }} />
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
            title="Editar texto "
          >
            <Edit2 size={12} />
          </Button>
        </>
      )}
    </div>
  );
}
