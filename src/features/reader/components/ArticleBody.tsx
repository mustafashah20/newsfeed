import type { ArticleBlock } from '@/services/news/types';

type ArticleBodyProps = {
  blocks: readonly ArticleBlock[];
};

type Group =
  | { kind: 'list'; items: string[]; start: number }
  | { kind: 'block'; block: ArticleBlock; start: number };

// Consecutive list items render as one <ul>.
function groupBlocks(blocks: readonly ArticleBlock[]): Group[] {
  const groups: Group[] = [];
  blocks.forEach((block, i) => {
    const last = groups.at(-1);
    if (block.type !== 'listItem') groups.push({ kind: 'block', block, start: i });
    else if (last?.kind === 'list') last.items.push(block.text);
    else groups.push({ kind: 'list', items: [block.text], start: i });
  });
  return groups;
}

/** Text blocks as plain elements: never HTML. Keys are positions in a fixed, ordered body. */
export function ArticleBody({ blocks }: ArticleBodyProps) {
  if (blocks.length === 0) return null;

  return (
    <div className="flex max-w-prose flex-col gap-5 text-base leading-relaxed break-words sm:text-lg sm:leading-8">
      {groupBlocks(blocks).map((group) => {
        if (group.kind === 'list') {
          return (
            <ul key={group.start} className="flex list-disc flex-col gap-2 pl-6">
              {group.items.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
          );
        }
        const { block } = group;
        if (block.type === 'heading') {
          return (
            <h2 key={group.start} className="mt-3 font-heading text-xl font-semibold sm:text-2xl">
              {block.text}
            </h2>
          );
        }
        if (block.type === 'quote') {
          return (
            <blockquote
              key={group.start}
              className="border-l-4 pl-4 whitespace-pre-line text-muted-foreground italic"
            >
              {block.text}
            </blockquote>
          );
        }
        return <p key={group.start}>{block.text}</p>;
      })}
    </div>
  );
}
