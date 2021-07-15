// I plan on either rewriting this to not use innerhtml or just use a library
// right now it's just copy-pasted from the old vanilla js version
import React from 'react';

interface Props {
  string: string;
}

const ParsedMarkdown: React.FC<Props> = ({ string }) => {
  const newData = string
    .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*)__/g, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/_(.*)_/gim, '<em>$1</em>')
    // doesn't work right now because the classes aren't present
    // want to change the whole approach anyway
    .replace(
      /~!(.*)!~/gim,
      `<span class="spoiler"><br><span class='hidden'>$1</span><br></span>`
    )
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/\n/g, '<br>');

  return <p dangerouslySetInnerHTML={{ __html: newData }} />;
};

export default ParsedMarkdown;
