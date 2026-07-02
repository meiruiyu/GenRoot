"use client";

import Link from "next/link";
import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import { demoArchive } from "@/lib/demo-data";
import { getLocalizedArchive } from "@/lib/i18n/demo-content";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Pill } from "@/components/Pill";
import type { FamilyMember } from "@/lib/types";

const relationEdges: Edge[] = [
  {
    id: "grandma-to-mia",
    source: "grandma-aqiao",
    target: "mia",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#9ba9a0" },
    style: { stroke: "#9ba9a0", strokeWidth: 2 },
  },
];

function MemberNode({ data }: NodeProps<{ member: FamilyMember }>) {
  const { t } = useLanguage();
  const { member } = data;

  return (
    <div className="w-[260px] rounded-[28px] glass-panel-strong p-4">
      <Handle type="target" position={Position.Top} className="!h-3 !w-3 !bg-[var(--accent)]" />
      <div className="flex items-center gap-4">
        <img src={member.avatar} alt={member.name} className="h-16 w-16 rounded-2xl object-cover" />
        <div>
          <p className="font-display text-2xl text-[var(--ink)]">{member.name}</p>
          <p className="text-sm text-[var(--muted)]">{member.relation}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{member.bio}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill>{member.generation}</Pill>
        <Pill tone="light">{t("familyTree.memoriesCount", { count: member.storyCount })}</Pill>
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
        {member.heritageLanguage}
      </p>
      <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !bg-[var(--ink)]" />
    </div>
  );
}

const nodeTypes = {
  member: MemberNode,
};

export default function FamilyTree() {
  const { locale, t } = useLanguage();
  const archive = useMemo(() => getLocalizedArchive(locale, demoArchive), [locale]);

  const nodes = useMemo<Node[]>(
    () =>
      archive.members
        .filter((member) => member.id === "grandma-aqiao" || member.id === "mia")
        .map((member) => ({
          id: member.id,
          type: "member",
          position: {
            x: member.id === "grandma-aqiao" ? 18 * 22 : 36 * 22,
            y: member.position.y * 8,
          },
          data: { member },
          draggable: false,
        })),
    [archive.members],
  );

  return (
    <div className="glass-panel overflow-hidden rounded-[32px]">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="h-[720px]">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={relationEdges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.18 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{
                type: "smoothstep",
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              }}
            >
              <Background color="rgba(255,255,255,0.18)" gap={28} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        <div className="border-l border-white/15 bg-[rgba(255,255,255,0.08)] p-6 backdrop-blur-xl">
          <p className="eyebrow">{t("familyTree.treeDetail")}</p>
          <h3 className="section-title font-display mt-2 text-[var(--ink)]">{t("familyTree.heading")}</h3>
          <p className="body-copy mt-3">{t("familyTree.body")}</p>
          <div className="body-copy mt-6 space-y-3">
            <p>{t("familyTree.bullet1")}</p>
            <p>{t("familyTree.bullet2")}</p>
            <p>{t("familyTree.bullet3")}</p>
            <p>{t("familyTree.bullet4")}</p>
          </div>
          <Link
            href="/memories/wax-dye-song"
            className="glass-button mt-5 inline-flex rounded-full px-5 py-3 text-sm font-medium"
          >
            {t("familyTree.openMemory")}
          </Link>
        </div>
      </div>
    </div>
  );
}
