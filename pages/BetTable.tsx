import { Table, Text } from "@geist-ui/react";

export function BetTable(): JSX.Element {
  const data = [
    {
      Bet: "-",
      Grade: "-",
      Result: "-",
      Date: "-",
    },
    {
      Bet: "-",
      Grade: "-",
      Result: "-",
      Date: "-",
    },
    {
      Bet: "-",
      Grade: "-",
      Result: "-",
      Date: "-",
    },
  ];
  return (
    <>
      <Text
        h3
        marginBottom={2}
        style={{
          textAlign: "center",
        }}
      >
        Coming Soon
      </Text>
      <Table
        style={{
          maxWidth: "1000px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        data={data}
      >
        <Table.Column prop="Bet" label="Bet" />
        <Table.Column prop="Grade" label="Grade" />
        <Table.Column prop="Result" label="Result" />
        <Table.Column prop="Date" label="Date" />
      </Table>
    </>
  );
}
