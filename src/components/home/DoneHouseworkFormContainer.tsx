import React, { useCallback, useMemo } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import { Controller, useForm } from "react-hook-form";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import DialogActions from "@material-ui/core/DialogActions";
import FormHelperText from "@material-ui/core/FormHelperText";
import { HouseworksFragment } from "src/hooks/houseworks/__generated__/HouseworksFragment";
import { CurrentFamilyMembersQuery_get_current_user_current_family_family_members } from "src/components/home/__generated__/CurrentFamilyMembersQuery";

type Props = {
  housework: HouseworksFragment;
  members: CurrentFamilyMembersQuery_get_current_user_current_family_family_members[];
  isOpen: boolean;
  onClose: () => void;
  doneHousework: (id: number, status: boolean, memberIds: number[]) => void;
};

type FormData = {
  status: boolean;
  memberIds: number[];
};

export const DoneHouseworkFormContainer: React.FC<Props> = ({
  housework,
  members,
  isOpen,
  onClose,
  doneHousework,
}) => {
  const alreadyMemberIds = useMemo((): number[] => {
    const ids = housework.housework_members.map((houseworkMember) => houseworkMember.member.id);
    return ids || [];
  }, [housework]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { status: housework.status, memberIds: [...alreadyMemberIds] },
  });

  const onClickDoneHousework = useCallback(
    async (data) => {
      const memberIds = data.memberIds.filter((id: number) => {
        return !alreadyMemberIds.includes(id);
      });
      await doneHousework(housework.id, data.status, memberIds);
      onClose();
    },
    [housework.id],
  );

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth>
      <DialogTitle>家事を完了</DialogTitle>
      <DialogContent>
        <Controller
          name={"status"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControl fullWidth>
              <FormControlLabel
                control={<Checkbox checked={value} onChange={onChange} />}
                label="ステータス"
              />
            </FormControl>
          )}
        />
        <Controller
          name="memberIds"
          control={control}
          rules={{ required: "メンバーを選択してください。" }}
          render={({ field: { onChange, value } }) => (
            <FormControl fullWidth error={Boolean(errors.memberIds)}>
              <InputLabel id="members-checkbox-label">家事をした人</InputLabel>
              <Select
                labelId="members-checkbox-label"
                id="members-checkbox"
                value={value}
                onChange={onChange}
                input={<Input />}
                renderValue={(selected) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  const selectedMembers = selected.map((id: number) => {
                    const selectedMember = members.find((member) => member.member.id === id);
                    return selectedMember?.member.name;
                  });
                  return selectedMembers.join(", ");
                }}
                multiple
              >
                {members.map((member) => (
                  <MenuItem key={member.member.id} value={member.member.id}>
                    <Checkbox checked={value.indexOf(member.member.id) > -1} />
                    <ListItemText primary={member.member.name} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.memberIds && "メンバーを選択してください。"}</FormHelperText>
            </FormControl>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default">
          キャンセル
        </Button>
        <Box mx="auto" />
        <Button
          onClick={handleSubmit(onClickDoneHousework)}
          disabled={isSubmitting}
          color="primary"
        >
          完了！
        </Button>
      </DialogActions>
    </Dialog>
  );
};
